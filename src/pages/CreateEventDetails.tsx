import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Alert, ScrollView, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { StackScreenProps } from '@react-navigation/stack';
import { createEvent, type NewEventDTO } from '../services/api';
import { uploadImage } from '../services/imageApi';

import BackHeader from '../components/BackHeader';

type Params = { position: { latitude: number; longitude: number } };

export default function CreateEventDetails({ route, navigation }: StackScreenProps<any>) {
  // grabbing the coordinates chosen on previous screen
  const { position } = route.params as Params;

  // basic form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [volunteersNeeded, setVolunteersNeeded] = useState('');

  // date handling
  // - store the date object in `date` for the date picker
  // - then mirror it to an ISO string in `dateTime` because API excpects a string
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [dateTime, setDateTime] = useState('');

  // image handling
  // - state to stor the img url
  // - storing  name / size of img for display
  const [imageUrl, setImageUrl] = useState('');
  const [imageMeta, setImageMeta] = useState<{ name?: string; size?: number } | null>(null);

  // guard so I can disable buttons while uploading/saving
  const [busy, setBusy] = useState(false);

  // form validation all feild are manditory 
  const isValid = useMemo(() => {
    if (!name || !description || !volunteersNeeded || !dateTime || !imageUrl) return false;
    return !Number.isNaN(+volunteersNeeded) && +volunteersNeeded > 0;
  }, [name, description, volunteersNeeded, dateTime, imageUrl]);

  // opens the date/time picker
  const openPicker = () => setShowPicker(true);

  // when the user picks a date/time:
  // - if dissmissed close the picker
  // - otherwise set date and ios string
  const onChangeDate = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    const picked = selected ?? date ?? new Date();
    setShowPicker(Platform.OS === 'ios');
    setDate(picked);
    // setting date in format the api expects
    setDateTime(picked.toISOString()); 
  };

  //"upload image" flow
  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission required', 'Enable photo library access.');
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset.base64) return Alert.alert('Error', 'Could not read selected image.');
    await uploadBase64(asset.base64, asset.fileName ?? undefined, asset.fileSize);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission required', 'Enable camera access.');
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset.base64) return Alert.alert('Error', 'Could not read captured image.');
    await uploadBase64(asset.base64, asset.fileName ?? undefined, asset.fileSize);
  };

  // upload to imgbb with my api code
  // send base64, get back a URL, and store it for saving and preview
  const uploadBase64 = async (base64: string, fileName?: string, fileSize?: number) => {
    setBusy(true);
    try {
      const res = await uploadImage(base64);
      const url = res.data?.data?.url || res.data?.image?.url || res.data?.data?.image?.url;
      if (!url) throw new Error('Upload failed (no URL).');
      setImageUrl(url);
      setImageMeta({ name: fileName, size: fileSize });
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message ?? 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  // save button handler
  // - validate and POST the new event then go back to map
  const onSave = async () => {
    if (!isValid) {
      Alert.alert('Missing info', 'Please fill all fields and upload an img');
      return;
    }
    setBusy(true);
    try {
      const payload: NewEventDTO = {
        name,
        description,
        // ISO string from the date picker
        dateTime,
        // URL returned by imgbb       
        imageUrl,
        // coords selected from location selection screen          
        position,          
        organizerId: 'dev',
        volunteersNeeded: +volunteersNeeded,
        volunteersIds: [],
      };
      const created = await createEvent(payload);
      console.log('[createEvent] success:', created);
      // back to map
      navigation.navigate('EventsMap'); 
    } catch (e: any) {
      console.log('[createEvent] error:', e?.message, e?.response?.data);
      Alert.alert('Error', e?.message ?? 'Could not save event');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.wrap}>

      <BackHeader title="Event Details" />

      <Text style={styles.title}>Add event</Text>

      {/* event title */}
      <Text style={styles.label}>Event Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Title"
        placeholderTextColor="#94a3b8"
      />

      {/* description */}
      <Text style={styles.label}>About</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Tell us about your event!"
        placeholderTextColor="#94a3b8"
        multiline
        maxLength={300}
      />

      {/* volunteers */}
      <Text style={styles.label}>Volunteers Needed</Text>
      <TextInput
        style={styles.input}
        value={volunteersNeeded}
        onChangeText={setVolunteersNeeded}
        placeholder="How many volunteers do you need?"
        keyboardType="number-pad"
        placeholderTextColor="#94a3b8"
      />

      {/* date & time*/}
      <Text style={styles.label}>Date & Time</Text>
      <TextInput
        style={styles.input}
        value={dateTime}
        placeholder="Pick a date & time"
        editable={false}
        placeholderTextColor="#94a3b8"
      />
      <RectButton style={[styles.btn, styles.secondary]} onPress={openPicker} enabled={!busy}>
        <Text style={styles.btnText}>Choose Date & Time</Text>
      </RectButton>

      {showPicker && (
        <DateTimePicker
          value={date ?? new Date()}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          textColor="#0f172a"
          themeVariant="light"
          onChange={onChangeDate}
          // don’t allow past dates
          minimumDate={new Date()} 
        />
      )}

      {/* Picture upload*/}
      <Text style={styles.label}>Picture</Text>
      <RectButton
        style={styles.uploadBox}
        onPress={() => {
          // alert user with options to upload pic
          Alert.alert(
            'Add Picture',
            'Choose an option',
            [
              { text: 'Camera', onPress: takePhoto },
              { text: 'Library', onPress: pickFromLibrary },
              { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
          );
        }}
        enabled={!busy}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.uploadImage} />
        ) : (
          <Text style={styles.uploadPlus}>+</Text>
        )}
      </RectButton>

      {!!imageUrl && (
        <View style={styles.previewMeta}>
          <Text style={styles.meta}>
            {imageMeta?.name ?? 'image'}{' '}
            {imageMeta?.size ? `(${Math.round(imageMeta.size / 1024)} KB)` : ''}
          </Text>
          <Text style={styles.metaSmall} numberOfLines={1}>
            {imageUrl}
          </Text>
        </View>
      )}

      {/* Save */}
      <RectButton
        style={[styles.btn, isValid ? styles.primary : styles.disabled]}
        enabled={isValid && !busy}
        onPress={onSave}
      >
        <Text style={[styles.btnText, { color: '#fff' }]}>Save</Text>
      </RectButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 10 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  label: { fontWeight: '600', marginTop: 6, marginBottom: 4, color: '#334155' },
  input: { backgroundColor: '#ffffffff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  textarea: { height: 100, textAlignVertical: 'top' },
  btn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flex: 1 },
  primary: { backgroundColor: '#00A3FF' },
  secondary: { backgroundColor: '#edf2f7' },
  disabled: { backgroundColor: '#cbd5e1' },
  btnText: { color: '#0f172a', fontWeight: '600' },

  // upload box 
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#93c5fd', 
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  uploadPlus: {
    fontSize: 40,
    color: '#60a5fa',
    lineHeight: 44,
  },
  uploadImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  previewMeta: {
    alignItems: 'center',
    gap: 4,
  },

  // meta text below immg preview
  meta: { color: '#334155' },
  metaSmall: { color: '#64748b', fontSize: 12, maxWidth: '100%' },
});
