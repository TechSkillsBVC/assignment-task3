import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RectButton } from "react-native-gesture-handler";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  EventsMap: undefined;
};

type CreateEventProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "EventsMap">;
};

export default function CreateEvent({ navigation }: CreateEventProps) {
  const [eventName, setEventName] = useState("");
  const [about, setAbout] = useState("");
  const [volunteers, setVolunteers] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [image, setImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const isFormComplete =
    eventName.trim() &&
    about.trim() &&
    volunteers.trim() &&
    dateTime.trim() &&
    image;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access media library was denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      const apiKey = process.env.IMGBB_API_KEY;
      const base64 = await fetch(uri).then((res) => res.blob());
      const formData = new FormData();
      formData.append("image", base64 as any);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data?.data?.url) {
        setImage({
          url: data.data.url,
          name: uri.split("/").pop(),
          size: `${Math.round((data.data.size / 1024) * 10) / 10} KB`,
        });
      } else {
        console.error("Image upload failed:", data);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const newEvent = {
      id: Date.now().toString(),
      name: eventName,
      about,
      volunteers,
      dateTime,
      image: image.url,
      position: {
        latitude: 51.045,
        longitude: -114.057,
      },
    };

    try {
      const stored = await AsyncStorage.getItem("events");
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [...existing, newEvent];
      await AsyncStorage.setItem("events", JSON.stringify(updated));

      console.log("Event created successfully!");
      navigation.navigate("EventsMap");
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Event Name</Text>
      <TextInput
        style={styles.input}
        value={eventName}
        onChangeText={setEventName}
      />

      <Text style={styles.label}>About</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={about}
        onChangeText={setAbout}
      />

      <Text style={styles.label}>Volunteers Needed</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={volunteers}
        onChangeText={setVolunteers}
      />

      <Text style={styles.label}>Date and Time</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Oct 20, 2023 11:00 AM"
        value={dateTime}
        onChangeText={setDateTime}
      />

      <Text style={styles.label}>Picture</Text>
      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image.url }} style={styles.image} />
          <Text style={styles.imageText}>
            {image.name} ({image.size})
          </Text>
        </View>
      ) : (
        <RectButton style={styles.imageButton} onPress={pickImage}>
          <Feather name="plus" size={20} color="#FFF" />
        </RectButton>
      )}

      {uploading && (
        <ActivityIndicator
          size="small"
          color="#00A3FF"
          style={{ marginTop: 10 }}
        />
      )}

      <RectButton
        style={[styles.saveButton, { opacity: isFormComplete ? 1 : 0.5 }]}
        enabled={!!isFormComplete}
        onPress={handleSave}
      >
        <Text style={styles.saveText}>Save</Text>
      </RectButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#FFF" },
  label: {
    fontFamily: "Nunito_700Bold",
    color: "#4D6F80",
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D3E2E6",
    borderRadius: 12,
    padding: 10,
    fontFamily: "Nunito_600SemiBold",
  },
  imageButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#00A3FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  imageContainer: { marginTop: 8 },
  image: { width: "100%", height: 150, borderRadius: 12 },
  imageText: {
    marginTop: 6,
    fontFamily: "Nunito_600SemiBold",
    color: "#8fa7b3",
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: "#00A3FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "#FFF", fontFamily: "Nunito_700Bold", fontSize: 16 },
});
