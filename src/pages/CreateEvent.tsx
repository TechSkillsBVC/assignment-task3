import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { StackScreenProps } from "@react-navigation/stack";
import { Feather } from "@expo/vector-icons";
import { createEvent } from "../services/api";
import { uploadImage } from "../services/imageApi";
import { RootStackParamList } from "../routes/AppStack";
import * as ImagePicker from "expo-image-picker";

type Props = StackScreenProps<RootStackParamList, "CreateEvent">;

export default function CreateEvent({ route, navigation }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [volunteersNeeded, setVolunteersNeeded] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState<{
    url: string;
    name: string;
    size: number;
  }>();
  const [busy, setBusy] = useState(false);

  const allFilled =
    name.trim() &&
    desc.trim() &&
    dateTime.trim() &&
    volunteersNeeded.trim() &&
    latitude.trim() &&
    longitude.trim() &&
    image?.url;

  async function pickImage() {
    try {
      Alert.alert("Add Picture", "Choose an option:", [
        { text: "Camera", onPress: () => selectImage("camera") },
        { text: "Gallery", onPress: () => selectImage("library") },
        { text: "Cancel", style: "cancel" },
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  async function selectImage(source: "camera" | "library") {
    try {
      const { status } =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission required", "Access denied.");
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
          : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

      if (result.canceled) return;

      const asset = result.assets[0];
      setImage({
        url: asset.uri,
        name: asset.fileName ?? "photo.jpg",
        size: asset.fileSize ?? 0,
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not open the image picker.");
    }
  }

  async function save() {
    try {
      setBusy(true);
      let uploadedUrl = image?.url;

      if (uploadedUrl && uploadedUrl.startsWith("file://")) {
        const file = new FileSystem.File(uploadedUrl);
        const base64 = await file.base64();
        const uploaded = await uploadImage(base64);
        uploadedUrl = uploaded.url;
      }

      const payload = {
        id: cryptoRandomId(),
        name,
        description: desc,
        dateTime,
        imageUrl: uploadedUrl,
        organizerId: "EF-BZ00",
        position: {
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        volunteersNeeded: Number(volunteersNeeded),
        volunteersIds: [],
      };

      await createEvent(payload);
      Alert.alert("Saved", "Event created successfully.");
      route.params?.onSaved?.();
      navigation.navigate("EventsMap");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not save the event.");
    } finally {
      setBusy(false);
    }
  }

  function removeImage() {
    setImage(undefined);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Event</Text>

      <LabeledInput label="Event Name" value={name} onChangeText={setName} />
      <LabeledInput
        label="About"
        value={desc}
        onChangeText={setDesc}
        multiline
        placeholder="300 characters max."
      />
      <LabeledInput
        label="Volunteers Needed"
        value={volunteersNeeded}
        onChangeText={setVolunteersNeeded}
        keyboardType="numeric"
      />
      <LabeledInput
        label="Date and Time"
        value={dateTime}
        onChangeText={setDateTime}
        placeholder="2025-12-31T16:30:00.000Z"
      />
      <LabeledInput
        label="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />
      <LabeledInput
        label="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Picture</Text>
      {!image?.url ? (
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={pickImage}
          disabled={busy}
        >
          <Feather name="plus" size={28} color="#00A3FF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.imageRow}>
          <Image source={{ uri: image.url }} style={styles.thumbnail} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.meta}>{image.name}</Text>
            <Text style={styles.meta}>{formatBytes(image.size)}</Text>
          </View>
          <TouchableOpacity onPress={removeImage}>
            <Feather name="x" size={24} color="#FF4B4B" />
          </TouchableOpacity>
        </View>
      )}

      <Button
        label={busy ? "Saving..." : "Save"}
        onPress={save}
        disabled={!allFilled || busy}
        color={allFilled ? "#00A3FF" : "#BFC3C9"}
      />
    </ScrollView>
  );
}

function LabeledInput(props: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          props.multiline && { height: 100, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}

function Button({
  label,
  onPress,
  disabled,
  color = "#00A3FF",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        { backgroundColor: color, opacity: disabled ? 0.6 : 1 },
      ]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024,
    sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    fontFamily: "Nunito_700Bold",
    fontSize: 22,
    color: "#031A62",
    marginBottom: 16,
  },
  label: {
    color: "#4D6F80",
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.4,
    borderColor: "#D3E2E5",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    color: "#5C8599",
    fontFamily: "Nunito_600SemiBold",
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: "#B0D9FF",
    borderStyle: "dashed",
    borderRadius: 10,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "#F9FCFF",
  },
  imageRow: {
    borderWidth: 1.5,
    borderColor: "#B0D9FF",
    borderRadius: 10,
    backgroundColor: "#F9FCFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#EEE",
  },
  meta: {
    color: "#5C8599",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
  },
  btn: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontFamily: "Nunito_700Bold" },
});
