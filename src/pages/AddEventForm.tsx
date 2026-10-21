import { Feather } from '@expo/vector-icons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ScreenHeader from '../components/ScreenHeader';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { RootStackParamList } from '../routes/types';
import * as api from '../services/api';
import { uploadImage } from '../services/imageApi';
import { NewEvent } from '../types/Event';
import { addHours, formatAMPM, formatBytes, getEnvironentVariable, updateDateWithNewTime } from '../utils';
import { isPositiveWholeNumber } from '../utils/events';

type Props = StackScreenProps<RootStackParamList, 'AddEventForm'>;

type UploadedImage = {
    url: string;
    uri: string;
    name: string;
    size: number;
};

const tomorrow = () => addHours(new Date(), 24);

export default function AddEventForm({ navigation, route }: Props) {
    const authenticationContext = useContext(AuthenticationContext);
    const { showActionSheetWithOptions } = useActionSheet();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');
    const [dateTime, setDateTime] = useState(tomorrow());
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [timePickerVisible, setTimePickerVisible] = useState(false);
    const [image, setImage] = useState<UploadedImage>();
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    const formIsValid = useMemo(
        () =>
            name.trim().length > 0 &&
            description.trim().length > 0 &&
            isPositiveWholeNumber(volunteersNeeded) &&
            dateTime.getTime() > Date.now() &&
            !!image?.url,
        [name, description, volunteersNeeded, dateTime, image]
    );

    const pickImage = () => {
        showActionSheetWithOptions(
            {
                options: ['Take photo', 'Choose from library', 'Cancel'],
                cancelButtonIndex: 2,
                title: 'Add an event photo',
            },
            (index) => {
                if (index === 0) selectImage('camera');
                if (index === 1) selectImage('library');
            }
        );
    };

    const selectImage = async (source: 'camera' | 'library') => {
        const permission =
            source === 'camera'
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert('Permission required', `Please allow ${source === 'camera' ? 'camera' : 'photo library'} access.`);
            return;
        }

        const result =
            source === 'camera'
                ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7, base64: true })
                : await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      quality: 0.7,
                      base64: true,
                  });

        if (result.canceled) return;
        const asset = result.assets[0];
        if (!asset.base64) {
            Alert.alert('Upload failed', 'The selected image could not be prepared for upload.');
            return;
        }
        if (!getEnvironentVariable('IMGBB_API_KEY')) {
            Alert.alert('Image service not configured', 'Add IMGBB_API_KEY to your environment before starting Expo.');
            return;
        }

        setIsUploading(true);
        try {
            const response = await uploadImage(asset.base64);
            const uploadedUrl = response.data?.data?.url;
            if (!uploadedUrl) throw new Error('The upload service did not return an image URL.');
            setImage({
                url: uploadedUrl,
                uri: asset.uri,
                name: asset.fileName || `event-photo-${Date.now()}.jpg`,
                size: asset.fileSize || Math.round((asset.base64.length * 3) / 4),
            });
        } catch (error: any) {
            Alert.alert('Upload failed', error.response?.data?.error?.message || error.message || 'Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const saveEvent = async () => {
        setShowErrors(true);
        if (!formIsValid || !image) {
            Alert.alert('Complete the form', 'Please complete every field and upload an event photo.');
            return;
        }

        const event: NewEvent = {
            name: name.trim(),
            description: description.trim(),
            dateTime: dateTime.toISOString(),
            imageUrl: image.url,
            organizerId: authenticationContext?.value?.id || '',
            position: route.params.position,
            volunteersNeeded: Number(volunteersNeeded),
            volunteersIds: [],
        };

        setIsSaving(true);
        try {
            await api.createEvent(event);
            navigation.navigate('EventsMap');
        } catch (error: any) {
            Alert.alert('Could not save event', error.response?.data || 'Check the API connection and try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const dateLabel = dateTime.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <View style={styles.container}>
            <ScreenHeader title="Add event" onClose={() => navigation.navigate('EventsMap')} />
            <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <FieldLabel label="Event name" invalid={showErrors && !name.trim()} />
                <TextInput value={name} onChangeText={setName} style={[styles.input, showErrors && !name.trim() && styles.invalid]} />

                <FieldLabel label="Description" invalid={showErrors && !description.trim()} />
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    style={[styles.input, styles.description, showErrors && !description.trim() && styles.invalid]}
                />

                <FieldLabel label="Volunteers needed" invalid={showErrors && !isPositiveWholeNumber(volunteersNeeded)} />
                <TextInput
                    value={volunteersNeeded}
                    onChangeText={setVolunteersNeeded}
                    keyboardType="number-pad"
                    style={[styles.input, showErrors && !isPositiveWholeNumber(volunteersNeeded) && styles.invalid]}
                />

                <FieldLabel label="Date and time" invalid={showErrors && dateTime.getTime() <= Date.now()} />
                <View style={styles.row}>
                    <RectButton style={[styles.pickerButton, styles.rowGap]} onPress={() => setDatePickerVisible(true)}>
                        <Feather name="calendar" size={18} color="#00A3FF" />
                        <Text style={styles.pickerText}>{dateLabel}</Text>
                    </RectButton>
                    <RectButton style={styles.pickerButton} onPress={() => setTimePickerVisible(true)}>
                        <Feather name="clock" size={18} color="#00A3FF" />
                        <Text style={styles.pickerText}>{formatAMPM(dateTime)}</Text>
                    </RectButton>
                </View>
                {showErrors && dateTime.getTime() <= Date.now() && <Text style={styles.errorText}>Choose a future date and time.</Text>}

                <FieldLabel label="Event photo" invalid={showErrors && !image} />
                {image ? (
                    <View style={styles.imageCard}>
                        <Image source={{ uri: image.uri }} style={styles.thumbnail} />
                        <View style={styles.imageInfo}>
                            <Text numberOfLines={1} style={styles.imageName}>{image.name}</Text>
                            <Text style={styles.imageSize}>{formatBytes(image.size)} · Uploaded</Text>
                        </View>
                        <RectButton onPress={() => setImage(undefined)} style={styles.removeButton}>
                            <Feather name="x" size={18} color="#FF7A7A" />
                        </RectButton>
                    </View>
                ) : (
                    <RectButton onPress={pickImage} style={[styles.photoButton, showErrors && styles.invalid]}>
                        <Feather name="image" size={22} color="#00A3FF" />
                        <Text style={styles.photoText}>{isUploading ? 'Uploading photo...' : 'Add photo'}</Text>
                    </RectButton>
                )}

                <RectButton
                    enabled={formIsValid && !isSaving && !isUploading}
                    onPress={saveEvent}
                    style={[styles.saveButton, !formIsValid && styles.disabled]}
                >
                    <Text style={styles.saveText}>Save</Text>
                </RectButton>
            </KeyboardAwareScrollView>

            <DateTimePickerModal
                isVisible={datePickerVisible}
                mode="date"
                minimumDate={new Date()}
                date={dateTime}
                onConfirm={(date) => {
                    const next = new Date(date);
                    next.setHours(dateTime.getHours(), dateTime.getMinutes(), 0, 0);
                    setDateTime(next);
                    setDatePickerVisible(false);
                }}
                onCancel={() => setDatePickerVisible(false)}
            />
            <DateTimePickerModal
                isVisible={timePickerVisible}
                mode="time"
                date={dateTime}
                onConfirm={(time) => {
                    setDateTime(updateDateWithNewTime(dateTime, time));
                    setTimePickerVisible(false);
                }}
                onCancel={() => setTimePickerVisible(false)}
            />
            <Spinner
                visible={isSaving || isUploading}
                textContent={isSaving ? 'Saving event...' : 'Uploading image...'}
                overlayColor="#031A62BF"
                textStyle={styles.spinnerText}
            />
        </View>
    );
}

function FieldLabel({ label, invalid }: { label: string; invalid: boolean }) {
    return (
        <View style={styles.labelRow}>
            <Text style={styles.label}>{label}</Text>
            {invalid && <Text style={styles.required}>required</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F3F5' },
    content: { padding: 24, paddingBottom: 44 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    label: { color: '#4D6F80', fontFamily: 'Nunito_600SemiBold', fontSize: 14 },
    required: { color: '#FF6B6B', fontFamily: 'Nunito_600SemiBold', fontSize: 12 },
    input: {
        height: 52,
        borderWidth: 1.4,
        borderColor: '#D3E2E5',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        marginBottom: 16,
        color: '#4D6F80',
        fontFamily: 'Nunito_600SemiBold',
    },
    description: { minHeight: 112, paddingTop: 14, paddingBottom: 14 },
    invalid: { borderColor: '#FF6B6B' },
    row: { flexDirection: 'row', marginBottom: 6 },
    rowGap: { marginRight: 10 },
    pickerButton: {
        flex: 1,
        height: 52,
        borderWidth: 1.4,
        borderColor: '#D3E2E5',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickerText: { marginLeft: 8, color: '#4D6F80', fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
    errorText: { color: '#FF6B6B', fontFamily: 'Nunito_600SemiBold', fontSize: 12, marginBottom: 12 },
    photoButton: {
        height: 64,
        borderWidth: 1.4,
        borderStyle: 'dashed',
        borderColor: '#9ACCE5',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 22,
    },
    photoText: { marginLeft: 10, color: '#00A3FF', fontFamily: 'Nunito_700Bold' },
    imageCard: {
        height: 76,
        borderWidth: 1.4,
        borderColor: '#D3E2E5',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
    },
    thumbnail: { width: 58, height: 58, borderRadius: 6 },
    imageInfo: { flex: 1, marginHorizontal: 10 },
    imageName: { color: '#4D6F80', fontFamily: 'Nunito_700Bold', fontSize: 13 },
    imageSize: { color: '#8FA7B3', fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 4 },
    removeButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    saveButton: { height: 56, borderRadius: 8, backgroundColor: '#00A3FF', alignItems: 'center', justifyContent: 'center' },
    disabled: { backgroundColor: '#B8D5E3' },
    saveText: { color: '#FFFFFF', fontFamily: 'Nunito_700Bold', fontSize: 16 },
    spinnerText: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
});
