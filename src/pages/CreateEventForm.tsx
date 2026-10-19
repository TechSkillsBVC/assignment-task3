import 'react-native-get-random-values';

import { Feather } from '@expo/vector-icons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { v4 as uuidv4 } from 'uuid';
import BigButton from '../components/BigButton';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { uploadImage } from '../services/imageApi';
import { EventPosition, VolunteerEvent } from '../types/VolunteerEvent';
import { formatAMPM, formatBytes } from '../utils';

interface UploadedImage {
    uri: string;
    name: string;
    size: number;
    url: string;
}

export default function CreateEventForm({ navigation, route }: StackScreenProps<any>) {
    const authenticationContext = useContext(AuthenticationContext);
    const { showActionSheetWithOptions } = useActionSheet();
    const position = route.params?.position as EventPosition;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');
    const [dateTime, setDateTime] = useState<Date>();
    const [datePickerIsVisible, setDatePickerIsVisible] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<UploadedImage>();
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const formIsValid = useMemo(() => {
        const volunteerCount = Number(volunteersNeeded);

        return (
            name.trim().length > 0 &&
            description.trim().length > 0 &&
            Number.isInteger(volunteerCount) &&
            volunteerCount > 0 &&
            !!dateTime &&
            dateTime.getTime() > Date.now() &&
            !!uploadedImage?.url &&
            !!position
        );
    }, [name, description, volunteersNeeded, dateTime, uploadedImage, position]);

    const uploadSelectedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!asset.base64) {
            Alert.alert('Image error', 'The selected picture could not be prepared for upload.');
            return;
        }

        setIsUploading(true);

        try {
            const response = await uploadImage(asset.base64);
            const imageUrl = response.data?.data?.url;

            if (!imageUrl) throw new Error('The upload service did not return an image URL.');

            const fallbackName = asset.uri.split('/').pop() || 'event-image.jpg';
            const estimatedSize = Math.ceil(asset.base64.length * 0.75);

            setUploadedImage({
                uri: asset.uri,
                name: asset.fileName || fallbackName,
                size: asset.fileSize || estimatedSize,
                url: imageUrl,
            });
        } catch (error) {
            console.warn('Image upload failed.', error);
            Alert.alert(
                'Upload failed',
                'The picture could not be uploaded. Check the ImgBB API key and try again.'
            );
        } finally {
            setIsUploading(false);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            Alert.alert('Camera permission required', 'Allow camera access to take an event picture.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadSelectedAsset(result.assets[0]);
        }
    };

    const chooseFromLibrary = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert('Photo permission required', 'Allow photo access to choose an event picture.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadSelectedAsset(result.assets[0]);
        }
    };

    const handleAddPicture = () => {
        showActionSheetWithOptions(
            {
                options: ['Take a photo', 'Choose from photo library', 'Cancel'],
                cancelButtonIndex: 2,
                title: 'Add event picture',
            },
            (selectedIndex) => {
                if (selectedIndex === 0) void takePhoto();
                if (selectedIndex === 1) void chooseFromLibrary();
            }
        );
    };

    const handleSave = async () => {
        if (!formIsValid || !dateTime || !uploadedImage || !authenticationContext?.value) return;

        const event: VolunteerEvent = {
            id: uuidv4(),
            name: name.trim(),
            description: description.trim(),
            dateTime: dateTime.toISOString(),
            imageUrl: uploadedImage.url,
            organizerId: authenticationContext.value.id,
            position,
            volunteersNeeded: Number(volunteersNeeded),
            volunteersIds: [],
        };

        setIsSaving(true);

        try {
            await api.createEvent(event);
            Alert.alert('Event saved', 'Your event was created successfully.', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('EventsMap'),
                },
            ]);
        } catch (error) {
            console.warn('Event creation failed.', error);
            Alert.alert('Save failed', 'The event could not be saved. Check the API connection and try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const formattedDateTime = dateTime
        ? `${dateTime.toLocaleDateString()} ${formatAMPM(dateTime)}`
        : 'Select a future date and time';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <RectButton style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#00A3FF" />
                </RectButton>
                <Text style={styles.headerTitle}>Add event</Text>
                <RectButton style={styles.headerButton} onPress={() => navigation.navigate('EventsMap')}>
                    <Feather name="x" size={24} color="#E85D75" />
                </RectButton>
            </View>

            <KeyboardAwareScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.form}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.label}>Event Name</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    placeholder="Enter the event name"
                    placeholderTextColor="#9AA7B1"
                />

                <View style={styles.labelRow}>
                    <Text style={styles.label}>About</Text>
                    <Text style={styles.characterCount}>{description.length}/200 characters</Text>
                </View>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    style={[styles.input, styles.descriptionInput]}
                    placeholder="Describe the event"
                    placeholderTextColor="#9AA7B1"
                    multiline
                    maxLength={200}
                    textAlignVertical="top"
                />

                <Text style={styles.label}>Volunteers Needed</Text>
                <TextInput
                    value={volunteersNeeded}
                    onChangeText={(value) => setVolunteersNeeded(value.replace(/[^0-9]/g, ''))}
                    style={styles.input}
                    placeholder="Enter a number"
                    placeholderTextColor="#9AA7B1"
                    keyboardType="number-pad"
                />

                <Text style={styles.label}>Date and Time</Text>
                <RectButton style={styles.selectionField} onPress={() => setDatePickerIsVisible(true)}>
                    <Text style={[styles.selectionText, dateTime && styles.selectedText]}>{formattedDateTime}</Text>
                    <Feather name="calendar" size={20} color="#00A3FF" />
                </RectButton>

                <Text style={styles.label}>Picture</Text>
                {uploadedImage ? (
                    <View style={styles.imageCard}>
                        <Image source={{ uri: uploadedImage.uri }} style={styles.thumbnail} />
                        <View style={styles.imageDetails}>
                            <Text style={styles.imageName} numberOfLines={1}>
                                {uploadedImage.name}
                            </Text>
                            <Text style={styles.imageSize}>{formatBytes(uploadedImage.size)}</Text>
                        </View>
                        <RectButton style={styles.removeImageButton} onPress={() => setUploadedImage(undefined)}>
                            <Feather name="x" size={22} color="#E85D75" />
                        </RectButton>
                    </View>
                ) : (
                    <RectButton
                        enabled={!isUploading}
                        style={styles.pictureButton}
                        onPress={handleAddPicture}
                    >
                        {isUploading ? (
                            <ActivityIndicator color="#00A3FF" />
                        ) : (
                            <>
                                <Feather name="plus" size={24} color="#00A3FF" />
                                <Text style={styles.pictureButtonText}>Add picture</Text>
                            </>
                        )}
                    </RectButton>
                )}

                <View style={styles.saveButtonContainer}>
                    <BigButton
                        label={isSaving ? 'Saving...' : 'Save'}
                        color="#00A3FF"
                        disabled={!formIsValid || isSaving || isUploading}
                        onPress={handleSave}
                    />
                </View>
            </KeyboardAwareScrollView>

            <DateTimePickerModal
                isVisible={datePickerIsVisible}
                mode="datetime"
                date={dateTime || new Date(Date.now() + 60 * 60 * 1000)}
                minimumDate={new Date()}
                onConfirm={(selectedDate) => {
                    setDateTime(selectedDate);
                    setDatePickerIsVisible(false);
                }}
                onCancel={() => setDatePickerIsVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAF4F7',
    },

    header: {
        height: 96,
        paddingTop: 32,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2,
    },

    headerButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 16,
        color: '#5C8599',
    },

    scrollView: {
        flex: 1,
    },

    form: {
        padding: 24,
        paddingBottom: 48,
    },

    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    label: {
        marginBottom: 6,
        fontFamily: 'Nunito_700Bold',
        fontSize: 14,
        color: '#5C8599',
    },

    characterCount: {
        marginBottom: 6,
        fontFamily: 'Nunito_400Regular',
        fontSize: 12,
        color: '#8FA7B3',
    },

    input: {
        height: 52,
        marginBottom: 18,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#D3E2E5',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        color: '#5C8599',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
    },

    descriptionInput: {
        height: 112,
        paddingTop: 14,
        paddingBottom: 14,
    },

    selectionField: {
        height: 52,
        marginBottom: 18,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#D3E2E5',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    selectionText: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        color: '#9AA7B1',
    },

    selectedText: {
        color: '#5C8599',
    },

    pictureButton: {
        height: 80,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#B8D4DF',
        borderRadius: 8,
        backgroundColor: '#FFFFFF80',
        justifyContent: 'center',
        alignItems: 'center',
    },

    pictureButtonText: {
        marginTop: 4,
        fontFamily: 'Nunito_600SemiBold',
        color: '#5C8599',
    },

    imageCard: {
        height: 80,
        padding: 8,
        borderWidth: 1,
        borderColor: '#00A3FF',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
    },

    thumbnail: {
        width: 64,
        height: 64,
        borderRadius: 6,
    },

    imageDetails: {
        flex: 1,
        marginHorizontal: 12,
    },

    imageName: {
        fontFamily: 'Nunito_700Bold',
        color: '#5C8599',
    },

    imageSize: {
        marginTop: 4,
        fontFamily: 'Nunito_400Regular',
        color: '#8FA7B3',
    },

    removeImageButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    saveButtonContainer: {
        height: 56,
        marginTop: 24,
    },
});
