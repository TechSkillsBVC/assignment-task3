import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import * as api from '../services/api';
import BigButton from '../components/BigButton';
import { Event } from '../types/Event';

export default function CreateEvent({ navigation }: StackScreenProps<any>) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [volunteersNeeded, setVolunteersNeeded] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageDetails, setImageDetails] = useState<{ name: string; size: string } | null>(null);

  const isFormValid = () => {
    return name && description && date && time && latitude && longitude && volunteersNeeded && image;
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera roll permissions to upload images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const fileName = uri.split('/').pop() || 'unknown.jpg';
      const fileSize = result.assets[0].fileSize || 0;
  
      try {
        const uploadResponse = await api.uploadImage(uri);
        setImage(uploadResponse.data.image.display_url);
        setImageDetails({ name: fileName, size: `${(fileSize / (1024 * 1024)).toFixed(2)} MB` });
      } catch (error) {
        console.error('Full error object:', JSON.stringify(error, null, 2));
        Alert.alert('Upload failed', 'There was an issue uploading the image. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    try {
      const newEvent: Partial<Event> = {
        name,
        description,
        dateTime: `${date}T${time}:00.000Z`,
        position: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        volunteersNeeded: parseInt(volunteersNeeded),
        imageUrl: image,
        organizerId: 'IWiVF-L',
        volunteersIds: [],
      };

      await api.createEvent(newEvent);
      navigation.navigate('EventsMap');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Event Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Event Name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>About</Text>
        <TextInput
          style={styles.textArea}
          placeholder="300 characters max."
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Volunteers Needed</Text>
        <TextInput
          style={styles.input}
          placeholder="Volunteers Needed"
          value={volunteersNeeded}
          onChangeText={setVolunteersNeeded}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inlineGroup}>
        <View style={styles.formGroupInline}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.inputInline}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />
        </View>

        <View style={styles.formGroupInline}>
          <Text style={styles.label}>Time</Text>
          <TextInput
            style={styles.inputInline}
            placeholder="HH:MM"
            value={time}
            onChangeText={setTime}
          />
        </View>
      </View>

      <View style={styles.inlineGroup}>
        <View style={styles.formGroupInline}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={styles.inputInline}
            placeholder="Latitude"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroupInline}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.inputInline}
            placeholder="Longitude"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Picture</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
          <Text style={styles.imagePickerText}>+</Text>
        </TouchableOpacity>
        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            {imageDetails && (
              <Text>{`${imageDetails.name} (${imageDetails.size})`}</Text>
            )}
          </View>
        )}
      </View>

      <BigButton
        label="Save"
        color="#00A3FF"
        onPress={handleSave}
        disabled={!isFormValid()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupInline: {
    flex: 1,
    marginRight: 10,
  },
  inlineGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  inputInline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 32,
    color: '#8E8E93',
  },
  imageContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
});

