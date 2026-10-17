
import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, ScrollView, Image, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RectButton } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/imageApi';
import { createEvent } from '../services/api';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { formatBytes } from '../utils';

export default function CreateEvent({ navigation, route }: StackScreenProps<any>) {
    const position = route.params?.position;
    const authenticationContext = useContext(AuthenticationContext);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [image, setImage] = useState<string>();
    const [imageBase64, setImageBase64] = useState<string>();
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [imageName, setImageName] = useState('');
    const [imageSize, setImageSize] = useState(0);

    const dateTime = `${date}T${time}`;

    const selectImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 || undefined);
            setUploadedImageUrl('');
            setImageName(result.assets[0].fileName || 'image');
            setImageSize(result.assets[0].fileSize || 0);
        }
    };

    const takePicture = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (permission.status !== 'granted') {
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 || undefined);
            setUploadedImageUrl('');
            setImageName(result.assets[0].fileName || 'image');
            setImageSize(result.assets[0].fileSize || 0);
        }
    };

    const handleUploadImage = () => {
        if (imageBase64) {
            uploadImage(imageBase64).then((response) => {
                setUploadedImageUrl(response.data.data.url);
                Alert.alert('Success', 'Image uploaded successfully');
            }).catch((error) => {
                console.log(error);
                Alert.alert('Error', 'Image upload failed');
            });
        }
    };

    const formIsValid = () => {
        return !!position &&
            name.trim() !== '' &&
            description.trim() !== '' &&
            volunteersNeeded.trim() !== '' &&
            Number(volunteersNeeded) > 0 &&
            Number.isInteger(Number(volunteersNeeded)) &&
            /^\d{4}-\d{2}-\d{2}$/.test(date) &&
            /^([01]\d|2[0-3]):[0-5]\d$/.test(time) &&
            !isNaN(new Date(dateTime).getTime()) &&
            new Date(dateTime) > new Date() &&
            uploadedImageUrl !== '';
    };

    const handleSave = () => {
        if (formIsValid()) {
            const event = {
                name: name,
                description: description,
                volunteersNeeded: Number(volunteersNeeded),
                dateTime: new Date(dateTime).toISOString(),
                position: position,
                imageUrl: uploadedImageUrl,
                organizerId: authenticationContext?.value.id,
                volunteersIds: [],
            };

            createEvent(event).then(() => {
                Alert.alert('Success', 'Event created successfully');
                navigation.navigate('EventsMap');
            }).catch((error) => {
                console.log(error);
                Alert.alert('Error', 'Could not create event');
            });
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Add Event</Text>

            <Text style={styles.label}>Event Location</Text>
            {position && (
                <Text style={styles.locationText}>
                    Latitude: {position.latitude}, Longitude: {position.longitude}
                </Text>
            )}

            <Text style={styles.label}>Event Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>About</Text>
            <TextInput
                style={[styles.input, styles.description]}
                value={description}
                onChangeText={setDescription}
                multiline={true}
                maxLength={300}
            />

            <Text style={styles.label}>Volunteers Needed</Text>
            <TextInput
                style={styles.input}
                value={volunteersNeeded}
                onChangeText={setVolunteersNeeded}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Date and Time</Text>
            <View style={styles.dateTimeContainer}>
                <TextInput
                    style={[styles.input, styles.dateTimeInput]}
                    value={date}
                    onChangeText={setDate}
                    placeholder="2026-10-25"
                />
                <TextInput
                    style={[styles.input, styles.dateTimeInput]}
                    value={time}
                    onChangeText={setTime}
                    placeholder="11:00"
                />
            </View>

            <Text style={styles.label}>Event Picture</Text>

            <RectButton style={styles.imageButton} onPress={selectImage}>
                <Text>Select from Gallery</Text>
            </RectButton>

            <RectButton style={styles.imageButton} onPress={takePicture}>
                <Text>Take Picture</Text>
            </RectButton>

            {image && (
                <Image
                    source={{ uri: image }}
                    style={styles.image}
                />
            )}

            {image && (
                <RectButton style={styles.imageButton} onPress={handleUploadImage}>
                    <Text>Upload Picture</Text>
                </RectButton>
            )}

            {uploadedImageUrl !== '' && (
                <Text style={styles.label}>
                    {imageName} - {formatBytes(imageSize)}
                </Text>
            )}

            <RectButton
                style={[styles.button, !formIsValid() && styles.disabled]}
                enabled={formIsValid()}
                onPress={handleSave}
            >
                <Text style={styles.buttonText}>Save</Text>
            </RectButton>

            <RectButton
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text>Back</Text>
            </RectButton>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#F2F3F5',
    },

    title: {
        fontSize: 24,
        marginBottom: 24,
        fontFamily: 'Nunito_700Bold',
    },

    label: {
        marginBottom: 8,
        color: '#4D6F80',
    },

    locationText: {
        marginBottom: 20,
        color: '#4D6F80',
    },

    input: {
        backgroundColor: '#FFF',
        padding: 12,
        marginBottom: 20,
        borderRadius: 8,
    },

    description: {
        height: 100,
        textAlignVertical: 'top',
    },

    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    dateTimeInput: {
        width: '48%',
    },

    imageButton: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        alignItems: 'center',
    },

    image: {
        width: 150,
        height: 150,
        marginBottom: 20,
        borderRadius: 8,
    },

    button: {
        backgroundColor: '#00A3FF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },

    disabled: {
        backgroundColor: '#8fa7b3',
    },

    buttonText: {
        color: '#FFF',
        fontFamily: 'Nunito_700Bold',
    },

    backButton: {
        alignItems: 'center',
        padding: 20,
    },
});
