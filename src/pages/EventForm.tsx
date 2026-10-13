import { useActionSheet } from '@expo/react-native-action-sheet';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import 'react-native-get-random-values';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { v4 as uuidv4 } from 'uuid';
import BigButton from '../components/BigButton';
import FormField from '../components/FormField';
import * as Colors from '../constants/Colors';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { uploadImage } from '../services/imageApi';
import { AppStackParamList } from '../types/Navigation';
import { castToNumber, formatAMPM, formatBytes } from '../utils';

interface UploadedImage {
    url: string;
    name: string;
    size: number;
}

export default function EventForm({ navigation, route }: StackScreenProps<AppStackParamList, 'EventForm'>) {
    const authenticationContext = useContext(AuthenticationContext);
    const { showActionSheetWithOptions } = useActionSheet();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');
    const [dateTime, setDateTime] = useState<Date>();
    const [datePickerIsVisible, setDatePickerIsVisible] = useState(false);
    const [image, setImage] = useState<UploadedImage>();

    const formIsValid =
        !!name.trim() && !!description.trim() && castToNumber(volunteersNeeded) > 0 && !!dateTime && !!image;

    const handleConfirmDateTime = (date: Date) => {
        setDateTime(date);
        setDatePickerIsVisible(false);
    };

    const handleAddPicture = () => {
        showActionSheetWithOptions(
            { options: ['Take Photo', 'Choose from Library', 'Cancel'], cancelButtonIndex: 2 },
            (index) => {
                if (index === 0) pickImage(true);
                if (index === 1) pickImage(false);
            }
        );
    };

    const pickImage = async (useCamera: boolean) => {
        const { granted } = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            Alert.alert('Permission required', 'Allow access in your device settings to add a picture.');
            return;
        }

        const options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true };
        const result = useCamera
            ? await ImagePicker.launchCameraAsync(options)
            : await ImagePicker.launchImageLibraryAsync(options);
        if (result.canceled) return;

        uploadImage(result.assets[0].base64 as string)
            .then((response) => {
                const { url, size, image } = response.data.data;
                setImage({ url, name: image.filename, size });
            })
            .catch(() => Alert.alert('Upload failed', 'The picture could not be uploaded. Please try again.'));
    };

    const handleSave = () => {
        api.createEvent({
            id: uuidv4(),
            dateTime: (dateTime as Date).toISOString(),
            description,
            imageUrl: image?.url,
            name,
            organizerId: authenticationContext?.value.id as string,
            position: route.params.position,
            volunteersNeeded: castToNumber(volunteersNeeded),
            volunteersIds: [],
        })
            .then(() => navigation.navigate('EventsMap'))
            .catch(() => Alert.alert('Save failed', 'The event could not be saved. Please try again.'));
    };

    return (
        <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.content}>
            <FormField label="Event Name">
                <TextInput style={[styles.input, styles.inputText]} value={name} onChangeText={setName} />
            </FormField>

            <FormField label="About" hint="300 characters max.">
                <TextInput
                    style={[styles.input, styles.inputText, styles.multilineInput]}
                    multiline
                    maxLength={300}
                    value={description}
                    onChangeText={setDescription}
                />
            </FormField>

            <FormField label="Volunteers Needed">
                <TextInput
                    style={[styles.input, styles.inputText]}
                    keyboardType="number-pad"
                    value={volunteersNeeded}
                    onChangeText={setVolunteersNeeded}
                />
            </FormField>

            <FormField label="Date and Time">
                <RectButton style={styles.inputButton} onPress={() => setDatePickerIsVisible(true)}>
                    <View style={styles.input}>
                        <Text style={styles.inputText}>
                            {dateTime &&
                                `${dateTime.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })} ${formatAMPM(dateTime).toUpperCase()}`}
                        </Text>
                    </View>
                </RectButton>
            </FormField>

            <FormField label="Picture">
                {image ? (
                    <View style={styles.uploadedPicture}>
                        <Image style={styles.thumbnail} source={{ uri: image.url }} />
                        <View style={styles.pictureDetails}>
                            <Text style={styles.pictureText}>{image.name}</Text>
                            <Text style={styles.pictureText}>{formatBytes(image.size)}</Text>
                        </View>
                        <BorderlessButton onPress={() => setImage(undefined)}>
                            <Feather name="x" size={31} color={Colors.RED} />
                        </BorderlessButton>
                    </View>
                ) : (
                    <RectButton style={styles.inputButton} onPress={handleAddPicture}>
                        <View style={styles.pictureInput}>
                            <Feather name="plus" size={27} color={Colors.BLUE} />
                        </View>
                    </RectButton>
                )}
            </FormField>

            <BigButton label="Save" color={Colors.BLUE} disabled={!formIsValid} onPress={handleSave} />

            <DateTimePickerModal
                isVisible={datePickerIsVisible}
                mode="datetime"
                minimumDate={new Date()}
                onConfirm={handleConfirmDateTime}
                onCancel={() => setDatePickerIsVisible(false)}
            />
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.BACKGROUND,
    },

    content: {
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    inputButton: {
        borderRadius: 8,
    },

    input: {
        backgroundColor: Colors.WHITE,
        borderWidth: 1,
        borderColor: Colors.GREY_LIGHT,
        borderRadius: 8,
        height: 56,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },

    multilineInput: {
        height: 111,
        paddingTop: 8,
        textAlignVertical: 'top',
    },

    inputText: {
        color: Colors.SLATE_LIGHT,
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
    },

    pictureInput: {
        backgroundColor: Colors.WHITE,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.BLUE,
        borderRadius: 8,
        height: 76,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.5,
    },

    uploadedPicture: {
        backgroundColor: Colors.BLUE_LIGHT,
        borderWidth: 1,
        borderColor: Colors.BLUE,
        borderRadius: 8,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },

    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 8,
    },

    pictureDetails: {
        flex: 1,
    },

    pictureText: {
        color: Colors.SLATE_LIGHT,
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
    },
});
