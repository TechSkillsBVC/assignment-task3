import 'react-native-get-random-values';

import { useActionSheet } from '@expo/react-native-action-sheet';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import { LatLng } from 'react-native-maps';
import { v4 as uuidv4 } from 'uuid';
import BigButton from '../components/BigButton';
import DateTimeField from '../components/DateTimeField';
import FormField from '../components/FormField';
import ImageUploadField from '../components/ImageUploadField';
import PageHeader from '../components/PageHeader';
import { Colors } from '../constants/Colors';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { uploadImage } from '../services/imageApi';
import { NewEvent } from '../types/Event';
import { UploadedImage } from '../types/UploadedImage';
import { updateDateWithNewTime } from '../utils';

const DESCRIPTION_MAX_LENGTH = 300;

type PickerSource = 'camera' | 'library';

/** Second step of the create-event flow: fill in the details and save. */
export default function CreateEvent({ navigation, route }: StackScreenProps<any>) {
    const { position } = route.params as { position: LatLng };

    const authenticationContext = useContext(AuthenticationContext);
    const { showActionSheetWithOptions } = useActionSheet();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');
    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState<Date>();
    const [image, setImage] = useState<UploadedImage>();

    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Every field is mandatory, so 'Save' stays disabled until they all hold a usable value.
    const isFormValid = useMemo(() => {
        const volunteers = Number(volunteersNeeded);

        return (
            name.trim().length > 0 &&
            description.trim().length > 0 &&
            description.length <= DESCRIPTION_MAX_LENGTH &&
            Number.isInteger(volunteers) &&
            volunteers > 0 &&
            !!date &&
            !!time &&
            !!image
        );
    }, [name, description, volunteersNeeded, date, time, image]);

    const pickImage = async (source: PickerSource) => {
        const permission =
            source === 'camera'
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Permission required',
                source === 'camera'
                    ? 'Volunteam needs access to your camera to take a picture for the event.'
                    : 'Volunteam needs access to your photos to add a picture to the event.'
            );
            return;
        }

        const result =
            source === 'camera'
                ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.5 })
                : await ImagePicker.launchImageLibraryAsync({
                      base64: true,
                      quality: 0.5,
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  });

        if (result.canceled || !result.assets?.length) return;

        const asset = result.assets[0];
        if (!asset.base64) return;

        setIsUploading(true);

        try {
            const url = await uploadImage(asset.base64);

            setImage({
                uri: asset.uri,
                url,
                name: asset.fileName || asset.uri.split('/').pop() || 'image.jpg',
                // fileSize is not reported on every platform; base64 length gives the same figure.
                size: asset.fileSize ?? Math.round((asset.base64.length * 3) / 4),
            });
        } catch (error) {
            Alert.alert('Upload failed', 'The picture could not be uploaded. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handlePickImage = () => {
        const options = ['Take a photo', 'Choose from library', 'Cancel'];

        showActionSheetWithOptions({ options, cancelButtonIndex: 2, title: 'Add a picture' }, (index) => {
            if (index === 0) pickImage('camera');
            if (index === 1) pickImage('library');
        });
    };

    const handleSave = async () => {
        if (!isFormValid || !date || !time || !image) return;

        const newEvent: NewEvent = {
            id: uuidv4(),
            name: name.trim(),
            description: description.trim(),
            dateTime: updateDateWithNewTime(date, time).toISOString(),
            organizerId: authenticationContext?.value?.id ?? '',
            imageUrl: image.url,
            position,
            volunteersNeeded: Number(volunteersNeeded),
            volunteersIds: [],
        };

        setIsSaving(true);

        try {
            await api.createEvent(newEvent);
            navigation.navigate('EventsMap');
        } catch (error) {
            Alert.alert('Could not save', 'The event could not be saved. Please check your connection.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <PageHeader
                title="Add event"
                onBackPress={navigation.goBack}
                onClosePress={() => navigation.navigate('EventsMap')}
            />

            <KeyboardAwareScrollView contentContainerStyle={styles.content}>
                <FormField label="Event Name">
                    <TextInput style={styles.input} value={name} onChangeText={setName} />
                </FormField>

                <FormField label="About" hint={`${DESCRIPTION_MAX_LENGTH} characters max.`}>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        multiline
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        value={description}
                        onChangeText={setDescription}
                    />
                </FormField>

                <FormField label="Volunteers Needed">
                    <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        value={volunteersNeeded}
                        onChangeText={(value) => setVolunteersNeeded(value.replace(/\D/g, ''))}
                    />
                </FormField>

                <FormField label="Date and Time">
                    <DateTimeField date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />
                </FormField>

                <FormField label="Picture">
                    <ImageUploadField
                        image={image}
                        isUploading={isUploading}
                        onPickPress={handlePickImage}
                        onRemovePress={() => setImage(undefined)}
                    />
                </FormField>

                <BigButton
                    label="Save"
                    color={isFormValid ? Colors.primary : Colors.primaryDisabled}
                    disabled={!isFormValid || isSaving}
                    onPress={handleSave}
                />
            </KeyboardAwareScrollView>

            <Spinner visible={isSaving} textContent="Saving..." overlayColor="#031A62BF" textStyle={styles.spinnerText} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    content: {
        padding: 24,
    },

    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1.4,
        borderColor: Colors.inputBorder,
        borderRadius: 16,
        minHeight: 56,
        paddingHorizontal: 20,
        paddingVertical: 16,

        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        color: Colors.body,
    },

    multilineInput: {
        minHeight: 120,
        textAlignVertical: 'top',
    },

    spinnerText: {
        fontSize: 16,
        fontFamily: 'Nunito_700Bold',
        color: '#fff',
    },
});
