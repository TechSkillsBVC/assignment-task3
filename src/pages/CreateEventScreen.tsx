import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/ImageAPI';
import { createEvent } from '../services/API';

export default function CreateEventScreen({ navigation, route }: any) {
    const { latitude: mapLat, longitude: mapLng } = route.params || {};

    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [latitude, setLatitude] = useState(mapLat ? String(mapLat) : '');
    const [longitude, setLongitude] = useState(mapLng ? String(mapLng) : '');
    
    const [imageUrl, setImageUrl] = useState('');
    const [imageDetails, setImageDetails] = useState<{ name: string; size: number } | null>(null);
    const [uploading, setUploading] = useState(false);

    // Read camera / gallery sensor permissions and launch picker
    const handlePickImage = async (useCamera: boolean) => {
        let permissionResult;
        if (useCamera) {
            permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        } else {
            permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Device sensor permissions are required to access camera/gallery!');
            return;
        }

        const pickerResult = useCamera 
            ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 })
            : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8 });

        if (!pickerResult.canceled && pickerResult.assets[0]) {
            const asset = pickerResult.assets[0];
            const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
            
            try {
                setUploading(true);
                // Send image file to internet storage service
                const response = await uploadImage(base64Uri);
                const remoteUrl = response.data.image.url;
                
                setImageUrl(remoteUrl);
                setImageDetails({
                    name: asset.fileName || 'event_image.jpg',
                    size: asset.fileSize || 0,
                });
            } catch (error) {
                Alert.alert('Upload Failed', 'Could not transmit image data to internet storage.');
            } finally {
                setUploading(false);
            }
        }
    };

    // Form Validation: All fields are mandatory
    const isFormValid = 
        name.trim() !== '' && 
        about.trim() !== '' && 
        volunteersNeeded.trim() !== '' && 
        dateTime.trim() !== '' && 
        latitude.trim() !== '' && 
        longitude.trim() !== '' && 
        imageUrl.trim() !== '';

    // Persist new event data to database
    const handleSaveEvent = async () => {
        if (!isFormValid) return;

        const newEvent = {
            name,
            about,
            volunteersNeeded: parseInt(volunteersNeeded, 10),
            dateTime,
            position: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            },
            image: imageUrl,
        };

        try {
            await createEvent(newEvent);
            // Navigate back to map screen (triggers re-fetch and updates display)
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to persist event data to database via internet.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Event Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter event name" />

            <Text style={styles.label}>About</Text>
            <TextInput style={[styles.input, { height: 80 }]} multiline value={about} onChangeText={setAbout} placeholder="Provide details about the event" />

            <Text style={styles.label}>Volunteers Needed</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={volunteersNeeded} onChangeText={setVolunteersNeeded} placeholder="e.g. 5" />

            <Text style={styles.label}>Date and Time</Text>
            <TextInput style={styles.input} value={dateTime} onChangeText={setDateTime} placeholder="YYYY-MM-DD HH:MM" />

            <Text style={styles.label}>Latitude</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={latitude} onChangeText={setLatitude} placeholder="e.g. 51.04112" />

            <Text style={styles.label}>Longitude</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={longitude} onChangeText={setLongitude} placeholder="e.g. -114.069325" />

            <Text style={styles.label}>Picture</Text>
            <View style={styles.imageButtonsContainer}>
                <RectButton style={styles.imageButton} onPress={() => handlePickImage(true)}>
                    <Text style={styles.imageButtonText}>Take Photo</Text>
                </RectButton>
                <RectButton style={styles.imageButton} onPress={() => handlePickImage(false)}>
                    <Text style={styles.imageButtonText}>Pick from Gallery</Text>
                </RectButton>
            </View>

            {uploading && <Text style={styles.loadingText}>Uploading image to storage...</Text>}

            {/* Thumbnail and file metadata display */}
            {imageUrl ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
                    {imageDetails && (
                        <View style={styles.fileDetails}>
                            <Text style={styles.fileName} numberOfLines={1}>{imageDetails.name}</Text>
                            <Text style={styles.fileSize}>{(imageDetails.size / 1024).toFixed(2)} KB</Text>
                        </View>
                    )}
                </View>
            ) : null}

            <RectButton 
                style={[styles.saveButton, { backgroundColor: isFormValid && !uploading ? '#00A3FF' : '#ccc' }]} 
                onPress={handleSaveEvent}
                enabled={isFormValid && !uploading}
            >
                <Text style={styles.saveButtonText}>Save / Next</Text>
            </RectButton>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 24, backgroundColor: '#FFF', flexGrow: 1 },
    label: { fontFamily: 'Nunito_700Bold', color: '#8fa7b3', marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: '#f5f8fa', borderWidth: 1.5, borderColor: '#d3e2e6', borderRadius: 20, height: 56, paddingHorizontal: 24, marginBottom: 12, textAlignVertical: 'center' },
    imageButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    imageButton: { backgroundColor: '#15c3d6', borderRadius: 20, height: 48, flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
    imageButtonText: { color: '#FFF', fontFamily: 'Nunito_700Bold' },
    loadingText: { marginVertical: 8, color: '#15c3d6', fontStyle: 'italic' },
    previewContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: '#f5f8fa', padding: 12, borderRadius: 12 },
    thumbnail: { width: 64, height: 64, borderRadius: 8, marginRight: 12 },
    fileDetails: { flex: 1 },
    fileName: { fontFamily: 'Nunito_700Bold', color: '#5c8599' },
    fileSize: { color: '#8fa7b3', fontSize: 12, marginTop: 4 },
    saveButton: { borderRadius: 20, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 40 },
    saveButtonText: { color: '#FFF', fontFamily: 'Nunito_700Bold', fontSize: 16 }
});