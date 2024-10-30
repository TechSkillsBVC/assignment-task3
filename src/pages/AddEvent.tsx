import React, { useState } from 'react';
import { Platform, View, Text, Alert, Image, Button, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker } from 'react-native-maps';
import { uploadImage } from '../services/imageApi';
import { StackScreenProps } from '@react-navigation/stack';
import Spacer from '../components/Spacer';

type ImageData = {
  uri: string;
  name: string;
  size?: number;
};

export default function AddEvent({ navigation }: StackScreenProps<any>) {
  const [image, setImage] = useState<ImageData | null>(null);
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [volunteersNeeded, setVolunteersNeeded] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [latitude, setLatitude] = useState(51.0447); // Default to Calgary
  const [longitude, setLongitude] = useState(-114.0719); // Default to Calgary
  const [showDatePicker, setShowDatePicker] = useState(false);

  const organizerId = 'EF-B200';

  // Function to pick an image
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const selectedImage = result.assets[0];
      setImage({ uri: selectedImage.uri, name: 'selectedImage.jpg' });

      try {
        const response = await uploadImage(selectedImage.uri);
        const imageUrl = response.data.data.url;
        setImage({ uri: imageUrl, name: 'selectedImage.jpg' });
        Alert.alert('Image Upload', 'Image uploaded successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image.');
      }
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateTime(selectedDate);
    }
  };

  // Improved form submission function
  const handleSubmit = async () => {
    if (!eventName || !description || !volunteersNeeded || !dateTime || !latitude || !longitude) {
      Alert.alert('Error', 'All fields except image are required.');
      return;
    }

    const newEvent = {
      name: eventName,
      description: description,
      imageUrl: image ? image.uri : null,
      dateTime: dateTime.toISOString(),
      volunteersNeeded: parseInt(volunteersNeeded),
      organizerId: organizerId,
      position: {
        latitude: latitude,
        longitude: longitude,
      },
    };

    try {
      const response = await fetch('http://10.0.0.119:3333/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        Alert.alert('Success', 'Event added successfully!');
        // Navigate back to the events map
        navigation.navigate('EventsMap');
      } else {
        Alert.alert('Error', 'Failed to add event.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while adding the event.');
    }
  };

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLatitude(latitude);
    setLongitude(longitude);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

        {/* Add Spacer for top margin */}
        <Spacer size={50} />

      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={eventName}
        onChangeText={setEventName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline={true}
        numberOfLines={4}
      />
      <TextInput
        style={styles.input}
        placeholder="Volunteers Needed"
        value={volunteersNeeded}
        onChangeText={setVolunteersNeeded}
        keyboardType="numeric"
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>Pick Date and Time</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dateTime}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Text style={styles.selectedDate}>Selected Date and Time: {dateTime.toLocaleString()}</Text>

      {image ? (
        <Image source={{ uri: image.uri }} style={styles.image} />
      ) : (
        <TouchableOpacity onPress={handlePickImage} style={styles.imagePicker}>
          <Text style={styles.imagePickerText}>Pick Image</Text>
        </TouchableOpacity>
      )}

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 51.0447,
          longitude: -114.0719,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onPress={handleMapPress}
      >
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
      <Text style={styles.selectedPosition}>
        Selected Position: {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </Text>

      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Add Event</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  dateButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00A3FF',
    borderRadius: 5,
    marginBottom: 10,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedDate: {
    marginBottom: 10,
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  imagePicker: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#777',
  },
  map: {
    height: 200,
    width: '100%',
    marginBottom: 10,
  },
  selectedPosition: {
    marginBottom: 10,
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
