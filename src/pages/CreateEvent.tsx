import 'react-native-get-random-values';
import * as FileSystem from 'expo-file-system';
import React, { useContext, useState } from 'react';
import {
    Alert,
    Image,
    ImageStyle,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { v4 as uuidv4 } from 'uuid';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { uploadImage } from '../services/imageApi';
import { getFromCache } from '../services/caching';
import { formatBytes } from '../utils';

interface SelectedImage {
    uri: string;
    base64: string;
    fileName: string;
    fileSize: number;
}

export default function CreateEvent({ navigation }: StackScreenProps<any>) {

    const authenticationContext = useContext(AuthenticationContext);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('1');

    const [eventDate, setEventDate] = useState(
        new Date(Date.now() + 60 * 60 * 1000)
    );

    const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

    const [position, setPosition] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [timePickerVisible, setTimePickerVisible] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // Select image from gallery
    const handleChooseImage = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    'Permission Required',
                    'Please allow access to your photo library.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                base64: true,
            });

            if (result.canceled) return;

            const asset = result.assets?.[0];

            if (!asset || !asset.base64) {
                Alert.alert('Error', 'Could not read the selected image.');
                return;
            }
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);

            setSelectedImage({
                uri: asset.uri,
                base64: asset.base64,
                fileName: asset.fileName || 'event-image.jpg',
                fileSize: fileInfo.exists ? fileInfo.size : (asset.fileSize ?? 0),
            });

        } catch (error) {
            Alert.alert('Error', 'Unable to select image.');
        }
    };

    // Take a photo using camera
    const handleTakePhoto = async () => {
    try {
        const permission =
            await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Permission Required',
                'Please allow camera access.'
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });

        if (result.canceled) return;

        const asset = result.assets?.[0];

        if (!asset || !asset.base64) {
            Alert.alert('Error', 'Could not read the photo.');
            return;
        }

        // Get the actual image file size
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);

        setSelectedImage({
            uri: asset.uri,
            base64: asset.base64,
            fileName: asset.fileName || 'event-photo.jpg',
            fileSize: fileInfo.exists
                ? fileInfo.size
                : (asset.fileSize ?? 0),
        });

    } catch (error) {
        console.log('CAMERA ERROR:', error);
        Alert.alert('Error', 'Unable to take photo.');
    }
};

    // Get current location
const handleGetLocation = async () => {
    console.log('LOCATION: BUTTON PRESSED');

    let subscription: Location.LocationSubscription | null = null;
    let timeout: ReturnType<typeof setTimeout>;

    try {
        const permission =
            await Location.requestForegroundPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Permission Required',
                'Please allow location access.'
            );
            return;
        }

        const lastLocation =
            await Location.getLastKnownPositionAsync();

        if (lastLocation) {
            const coords = lastLocation.coords;

            setPosition({
                latitude: coords.latitude,
                longitude: coords.longitude,
            });

            console.log('LAST KNOWN LOCATION:', coords);

            Alert.alert(
                'Success',
                `Location received!\nLatitude: ${coords.latitude}\nLongitude: ${coords.longitude}`
            );
            return;
        }

        const servicesEnabled =
            await Location.hasServicesEnabledAsync();

        if (!servicesEnabled) {
            Alert.alert(
                'Location Disabled',
                'Please enable location services.'
            );
            return;
        }

        console.log('Waiting for GPS location...');

        const location = await new Promise<Location.LocationObject>(
            async (resolve, reject) => {
                timeout = setTimeout(() => {
                    subscription?.remove();
                    reject(new Error('Location request timed out.'));
                }, 15000);

                try {
                    subscription = await Location.watchPositionAsync(
                        {
                            accuracy: Location.Accuracy.Balanced,
                            timeInterval: 1000,
                            distanceInterval: 0,
                        },
                        (newLocation) => {
                            clearTimeout(timeout);
                            subscription?.remove();
                            resolve(newLocation);
                        }
                    );
                } catch (error) {
                    clearTimeout(timeout);
                    reject(error);
                }
            }
        );

        const coords = location.coords;

        setPosition({
            latitude: coords.latitude,
            longitude: coords.longitude,
        });

        console.log('CURRENT LOCATION:', coords);

        Alert.alert(
            'Success',
            `Location received!\nLatitude: ${coords.latitude}\nLongitude: ${coords.longitude}`
        );

    } catch (error: any) {
        console.log('LOCATION ERROR:', error);

        Alert.alert(
            'Location Error',
            error?.message || String(error)
        );
    }
};
    // Select event date
    const handleDateConfirm = (date: Date) => {
        const updatedDate = new Date(eventDate);

        updatedDate.setFullYear(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

        setEventDate(updatedDate);
        setDatePickerVisible(false);
    };

    // Select event time
    const handleTimeConfirm = (time: Date) => {
        const updatedDate = new Date(eventDate);

        updatedDate.setHours(
            time.getHours(),
            time.getMinutes(),
            0,
            0
        );

        setEventDate(updatedDate);
        setTimePickerVisible(false);
    };

    // Save event
    const handleCreateEvent = async () => {

        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter event name.');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Validation Error', 'Please enter event description.');
            return;
        }

        const volunteers = Number(volunteersNeeded);

        if (
            !Number.isInteger(volunteers) ||
            volunteers < 1
        ) {
            Alert.alert(
                'Validation Error',
                'Please enter a valid number of volunteers.'
            );
            return;
        }

        if (eventDate.getTime() <= Date.now()) {
            Alert.alert(
                'Validation Error',
                'Event date and time must be in the future.'
            );
            return;
        }

        if (!selectedImage) {
            Alert.alert('Validation Error', 'Please select an event image.');
            return;
        }

        if (!position) {
            Alert.alert(
                'Validation Error',
                'Please get your current location.'
            );
            return;
        }

        const organizerId = authenticationContext?.value?.id;

        if (!organizerId) {
            Alert.alert('Error', 'User information is missing. Please log in again.');
            return;
        }

        setIsLoading(true);

        try {

            // Get access token
            const accessToken = await getFromCache<string>('accessToken');

            // Upload image to ImgBB
            const imageResponse = await uploadImage(selectedImage.base64);

            const imageUrl = imageResponse.data.data.url;

            // Create event object
            const newEvent: api.CreateEventData = {
                id: uuidv4(),
                name: name.trim(),
                description: description.trim(),
                dateTime: eventDate.toISOString(),
                imageUrl: imageUrl,
                organizerId: organizerId,
                position: position,
                volunteersNeeded: volunteers,
                volunteersIds: [],
            };

            // Save event to server
            await api.createEvent(newEvent, accessToken);

            setIsLoading(false);

            Alert.alert(
                'Success',
                'Your event has been created successfully.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );

        } catch (error: any) {

            setIsLoading(false);

            console.log('Create Event Error:', error.response?.data || error.message);

            Alert.alert(
                'Error',
                error.response?.data?.message ||
                'Could not create event. Please check your internet connection and try again.'
            );
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >

            <Text style={styles.title}>Create New Event</Text>

            {/* Event name */}
            <Text style={styles.label}>Event Name *</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter event name"
                value={name}
                onChangeText={setName}
            />

            {/* Description */}
            <Text style={styles.label}>Description *</Text>

            <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Describe your event"
                value={description}
                onChangeText={setDescription}
                multiline
            />

            {/* Date */}
            <Text style={styles.label}>Event Date *</Text>

            <TouchableOpacity
                style={styles.selectionButton}
                onPress={() => setDatePickerVisible(true)}
            >
                <Text style={styles.buttonText}>
                    {eventDate.toLocaleDateString()}
                </Text>
            </TouchableOpacity>

            {/* Time */}
            <Text style={styles.label}>Event Time *</Text>

            <TouchableOpacity
                style={styles.selectionButton}
                onPress={() => setTimePickerVisible(true)}
            >
                <Text style={styles.buttonText}>
                    {eventDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </TouchableOpacity>

            <DateTimePickerModal
                isVisible={datePickerVisible}
                mode="date"
                date={eventDate}
                minimumDate={new Date()}
                onConfirm={handleDateConfirm}
                onCancel={() => setDatePickerVisible(false)}
            />

            <DateTimePickerModal
                isVisible={timePickerVisible}
                mode="time"
                date={eventDate}
                onConfirm={handleTimeConfirm}
                onCancel={() => setTimePickerVisible(false)}
            />

            {/* Volunteers */}
            <Text style={styles.label}>Volunteers Needed *</Text>

            <TextInput
                style={styles.input}
                placeholder="Number of volunteers"
                value={volunteersNeeded}
                onChangeText={setVolunteersNeeded}
                keyboardType="numeric"
            />

            {/* Image */}
            <Text style={styles.label}>Event Image *</Text>

            <View style={styles.imageButtons}>

                <TouchableOpacity
                    style={styles.selectionButton}
                    onPress={handleChooseImage}
                >
                    <Text style={styles.buttonText}>Choose from Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.selectionButton}
                    onPress={handleTakePhoto}
                >
                    <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>

            </View>

            {selectedImage && (
                <View style={styles.imageContainer}>

                    <Image
                        source={{ uri: selectedImage.uri }}
                       style={styles.previewImage as ImageStyle}
                    />

                    <Text style={styles.imageInfo}>
                        {selectedImage.fileName}
                    </Text>

                    <Text style={styles.imageInfo}>
                        Size: {formatBytes(selectedImage.fileSize)}
                    </Text>

                </View>
            )}

            {/* Location */}
            <Text style={styles.label}>Event Location *</Text>

            <TouchableOpacity
                style={styles.selectionButton}
                onPress={handleGetLocation}
            >
                <Text style={styles.buttonText}>Get Current Location</Text>
            </TouchableOpacity>

            {position && (
                <Text style={styles.locationText}>
                    Latitude: {position.latitude.toFixed(5)}{"\n"}
                    Longitude: {position.longitude.toFixed(5)}
                </Text>
            )}

            {/* Submit */}
            <TouchableOpacity
                style={[
                    styles.createButton,
                    isLoading && styles.disabledButton,
                ]}
                onPress={handleCreateEvent}
                disabled={isLoading}
            >

                {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.createButtonText}>
                        Create Event
                    </Text>
                )}

            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>Back to Map</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F2F3F5',
    },

    content: {
        padding: 24,
        paddingBottom: 50,
    },

    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#031A62',
        marginBottom: 24,
        textAlign: 'center',
    },

    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4D6F80',
        marginBottom: 8,
        marginTop: 14,
    },

    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D3E2E5',
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: '#333333',
    },

    descriptionInput: {
        height: 120,
        textAlignVertical: 'top',
    },

    selectionButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D3E2E5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 8,
        alignItems: 'center',
    },

    buttonText: {
        color: '#031A62',
        fontSize: 14,
        fontWeight: '600',
    },

    imageButtons: {
    flexDirection: 'column',
},
    imageContainer: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },

    previewImage: {
        width: '100%',
        height: 180,
        borderRadius: 8,
        resizeMode: 'cover',
    },

    imageInfo: {
        color: '#4D6F80',
        fontSize: 13,
        marginTop: 6,
    },

    locationText: {
        color: '#4D6F80',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        lineHeight: 22,
    },

    createButton: {
        backgroundColor: '#00A3FF',
        padding: 17,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
    },

    disabledButton: {
        opacity: 0.6,
    },

    createButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },

    backButton: {
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },

    backButtonText: {
        color: '#4D6F80',
        fontSize: 15,
    },

});