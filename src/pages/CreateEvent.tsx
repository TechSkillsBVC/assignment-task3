import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useState, useEffect } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { createEvent } from '../services/api';

export default function CreateEvent({ route, navigation }: StackScreenProps<any>) {
    const { position } = route.params;
    const authenticationContext = useContext(AuthenticationContext);
    const currentUserId = authenticationContext?.value?.id;

    const [eventName, setEventName] = useState('');
    const [about, setAbout] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [imageUri, setImageUri] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageSize, setImageSize] = useState('');
    const [imageName, setImageName] = useState('');
    const [uploading, setUploading] = useState(false);
    
    // Permission states
    const [cameraPermission, setCameraPermission] = useState<string>('undetermined');
    const [galleryPermission, setGalleryPermission] = useState<string>('undetermined');

    // Check permissions on component mount
    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        console.log('=== CHECKING PERMISSIONS ===');
        
        // Check camera permission
        const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
        console.log('Camera permission status:', cameraStatus.status);
        setCameraPermission(cameraStatus.status);
        
        // Check media library permission
        const mediaStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
        console.log('Gallery permission status:', mediaStatus.status);
        setGalleryPermission(mediaStatus.status);
    };

    const openSettings = () => {
        Alert.alert(
            'Permissions Required',
            'Please enable camera and photo library permissions in Settings',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
        );
    };

    const getPermissionIcon = (status: string) => {
        switch (status) {
            case 'granted':
                return <Feather name="check-circle" size={16} color="#28A745" />;
            case 'denied':
                return <Feather name="x-circle" size={16} color="#FF669D" />;
            default:
                return <Feather name="help-circle" size={16} color="#8FA7B3" />;
        }
    };

    const getPermissionText = (status: string) => {
        switch (status) {
            case 'granted':
                return 'Granted';
            case 'denied':
                return 'Denied';
            default:
                return 'Not requested';
        }
    };

    const isFormValid = () => {
        return (
            eventName.trim() !== '' &&
            about.trim() !== '' &&
            volunteersNeeded !== '' &&
            parseInt(volunteersNeeded) > 0
        );
    };

    const uploadImageToImgBB = async (uri: string) => {
        try {
            setUploading(true);

            // Get file info
            const filename = uri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            // Create form data
            const formData = new FormData();
            formData.append('image', {
                uri,
                name: filename,
                type,
            } as any);

            // Upload to ImgBB (free image hosting)
            // API Key: Get yours at https://api.imgbb.com/
            const imgbbApiKey = 'd45bf35e5d45f3a6ab0f6a8c5e8d9f2a'; // Demo key - replace with your own

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();
            
            console.log('=== ImgBB Upload Response ===');
            console.log('Success:', data.success);
            console.log('Full response:', JSON.stringify(data, null, 2));

            if (data.success) {
                // Use display_url which is more reliable for viewing
                const uploadedUrl = data.data.display_url || data.data.url;
                const fileSize = data.data.size;
                
                console.log('Image URL to use:', uploadedUrl);
                console.log('File size:', fileSize);
                
                setImageUrl(uploadedUrl);
                setImageUri(uri);
                setImageName(filename);
                setImageSize(formatFileSize(fileSize));

                Alert.alert('Success', 'Image uploaded successfully!');
                return uploadedUrl;
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', 'Using placeholder image instead');
            
            // Fallback to placeholder
            const fallbackUrl = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800';
            setImageUrl(fallbackUrl);
            setImageUri(uri);
            setImageName('placeholder.jpg');
            setImageSize('N/A');
            
            return fallbackUrl;
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleImagePicker = async () => {
        try {
            // Check permission first
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setGalleryPermission(permissionResult.status);

            if (!permissionResult.granted) {
                openSettings();
                return;
            }

            // Pick image
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                await uploadImageToImgBB(asset.uri);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleCameraPicker = async () => {
        try {
            // Check permission first
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            setCameraPermission(permissionResult.status);

            if (!permissionResult.granted) {
                openSettings();
                return;
            }

            // Take photo
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                await uploadImageToImgBB(asset.uri);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const handleSave = async () => {
        if (!isFormValid()) {
            Alert.alert('Validation Error', 'Please fill all required fields');
            return;
        }

        try {
            const eventDateTime = new Date(date);
            eventDateTime.setHours(time.getHours());
            eventDateTime.setMinutes(time.getMinutes());

            const newEvent = {
                name: eventName,
                description: about,
                dateTime: eventDateTime.toISOString(),
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
                organizerId: currentUserId,
                position: position,
                volunteersNeeded: parseInt(volunteersNeeded),
                volunteersIds: [],
            };

            await createEvent(newEvent);
            Alert.alert('Success', 'Event saved! You can continue editing or click Next.');
            return true;
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save event');
            return false;
        }
    };

    const handleSaveAndNavigate = async () => {
        const saved = await handleSave();
        if (saved) {
            navigation.navigate('EventsMap');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <RectButton onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#00A3FF" />
                </RectButton>
                <Text style={styles.headerTitle}>Add event</Text>
                <RectButton onPress={() => navigation.navigate('EventsMap')}>
                    <Feather name="x" size={24} color="#FF669D" />
                </RectButton>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Permission Status Display */}
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionTitle}>Permissions Status</Text>
                    <View style={styles.permissionRow}>
                        {getPermissionIcon(cameraPermission)}
                        <Text style={styles.permissionText}>
                            Camera: {getPermissionText(cameraPermission)}
                        </Text>
                    </View>
                    <View style={styles.permissionRow}>
                        {getPermissionIcon(galleryPermission)}
                        <Text style={styles.permissionText}>
                            Gallery: {getPermissionText(galleryPermission)}
                        </Text>
                    </View>
                    {(cameraPermission === 'denied' || galleryPermission === 'denied') && (
                        <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
                            <Feather name="settings" size={16} color="#00A3FF" />
                            <Text style={styles.settingsButtonText}>Open Settings</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.label}>Event Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Event name"
                    placeholderTextColor="#8FA7B3"
                    value={eventName}
                    onChangeText={setEventName}
                />

                <Text style={styles.label}>About</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Write about the event"
                    placeholderTextColor="#8FA7B3"
                    value={about}
                    onChangeText={setAbout}
                    multiline
                    numberOfLines={5}
                />

                <Text style={styles.label}>Volunteers Needed</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#8FA7B3"
                    value={volunteersNeeded}
                    onChangeText={setVolunteersNeeded}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Date</Text>
                <TouchableOpacity 
                    style={styles.dateTimeButton} 
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.dateTimeText}>
                        {date.toLocaleDateString()}
                    </Text>
                    <Feather name="calendar" size={20} color="#00A3FF" />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (event.type !== 'dismissed' && selectedDate) {
                                setDate(selectedDate);
                            }
                        }}
                    />
                )}

                <Text style={styles.label}>Time</Text>
                <TouchableOpacity 
                    style={styles.dateTimeButton} 
                    onPress={() => setShowTimePicker(true)}
                >
                    <Text style={styles.dateTimeText}>
                        {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                    <Feather name="clock" size={20} color="#00A3FF" />
                </TouchableOpacity>

                {showTimePicker && (
                    <DateTimePicker
                        value={time}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                            setShowTimePicker(false);
                            if (event.type !== 'dismissed' && selectedTime) {
                                setTime(selectedTime);
                            }
                        }}
                    />
                )}

                <Text style={styles.label}>Position</Text>
                <View style={styles.positionBox}>
                    <Text style={styles.positionText}>
                        Lat: {position.latitude.toFixed(6)}, Long: {position.longitude.toFixed(6)}
                    </Text>
                </View>

                <Text style={styles.label}>Photos</Text>
                <View style={styles.imageButtonsRow}>
                    <TouchableOpacity 
                        style={styles.addImageButton} 
                        onPress={handleImagePicker}
                        disabled={uploading}
                    >
                        <Feather name="image" size={24} color={uploading ? "#8FA7B3" : "#00A3FF"} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.addImageButton} 
                        onPress={handleCameraPicker}
                        disabled={uploading}
                    >
                        <Feather name="camera" size={24} color={uploading ? "#8FA7B3" : "#00A3FF"} />
                    </TouchableOpacity>
                </View>

                {uploading && (
                    <View style={styles.uploadingContainer}>
                        <ActivityIndicator size="small" color="#00A3FF" />
                        <Text style={styles.uploadingText}>Uploading image...</Text>
                    </View>
                )}

                {imageUri && !uploading && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                        <View style={styles.imageInfo}>
                            <Text style={styles.imageName} numberOfLines={1}>{imageName}</Text>
                            <Text style={styles.imageSize}>{imageSize}</Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            setImageUri('');
                            setImageUrl('');
                            setImageName('');
                            setImageSize('');
                        }}>
                            <Feather name="x" size={24} color="#FF669D" />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <RectButton
                    style={[styles.saveButton, (!isFormValid() || uploading) && styles.buttonDisabled]}
                    onPress={handleSave}
                    enabled={isFormValid() && !uploading}
                >
                    <Text style={styles.saveButtonText}>
                        {uploading ? 'Uploading...' : 'Save'}
                    </Text>
                </RectButton>
                
                <RectButton
                    style={[styles.nextButton, (!isFormValid() || uploading) && styles.buttonDisabled]}
                    onPress={handleSaveAndNavigate}
                    enabled={isFormValid() && !uploading}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                </RectButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F3F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#D3E2E5',
    },
    headerTitle: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 16,
        color: '#8FA7B3',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    permissionContainer: {
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#D3E2E5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    permissionTitle: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: '#4D6F80',
        marginBottom: 12,
    },
    permissionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    permissionText: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 13,
        color: '#5C8599',
    },
    settingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    settingsButtonText: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 13,
        color: '#00A3FF',
    },
    label: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: '#8FA7B3',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#D3E2E5',
        borderRadius: 16,
        padding: 16,
        fontFamily: 'Nunito_400Regular',
        fontSize: 15,
        color: '#5C8599',
    },
    textArea: {
        height: 110,
        textAlignVertical: 'top',
    },
    dateTimeButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#D3E2E5',
        borderRadius: 16,
        padding: 16,
    },
    dateTimeText: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 15,
        color: '#5C8599',
    },
    positionBox: {
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#D3E2E5',
        borderRadius: 16,
        padding: 16,
    },
    positionText: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 15,
        color: '#5C8599',
    },
    imageButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    addImageButton: {
        width: 56,
        height: 56,
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#D3E2E5',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#D3E2E5',
        borderRadius: 16,
        padding: 16,
        marginTop: 12,
        gap: 12,
    },
    uploadingText: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 14,
        color: '#8FA7B3',
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#D3E2E5',
        borderRadius: 16,
        padding: 12,
        marginTop: 12,
        gap: 12,
    },
    imagePreview: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    imageInfo: {
        flex: 1,
    },
    imageName: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: '#4D6F80',
    },
    imageSize: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 12,
        color: '#8FA7B3',
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        padding: 24,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#D3E2E5',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#28A745',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 16,
        color: '#FFF',
    },
    nextButton: {
        flex: 1,
        backgroundColor: '#00A3FF',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#D3E2E5',
    },
    nextButtonText: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 16,
        color: '#FFF',
    },
});
