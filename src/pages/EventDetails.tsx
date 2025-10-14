import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { RectButton } from "react-native-gesture-handler";

type Event = {
  name: string;
  about: string;
  volunteers: number;
  dateTime: string;
  image: string;
};

type EventDetailsProps = {
  route: { params: { event: Event } };
  navigation: { navigate: (screen: string) => void };
};

export default function EventDetails({ route, navigation }: EventDetailsProps) {
  const { event } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Image source={{ uri: event.image }} style={styles.image} />

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{event.name}</Text>
          <Text style={styles.about}>{event.about}</Text>

          <View style={styles.section}>
            <Feather name="users" size={20} color="#00A3FF" />
            <Text style={styles.detail}>
              Volunteers Needed: {event.volunteers}
            </Text>
          </View>

          <View style={styles.section}>
            <Feather name="calendar" size={20} color="#00A3FF" />
            <Text style={styles.detail}>{event.dateTime}</Text>
          </View>
        </View>

        <RectButton
          style={styles.backButton}
          onPress={() => navigation.navigate("EventsMap")}
        >
          <Feather name="arrow-left" size={20} color="#FFF" />
          <Text style={styles.backText}>Back to Map</Text>
        </RectButton>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f3f5" },
  image: { width: "100%", height: 200, borderRadius: 16, marginBottom: 24 },
  infoContainer: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  title: { fontFamily: "Nunito_800ExtraBold", fontSize: 22, color: "#4D6F80" },
  about: { fontFamily: "Nunito_600SemiBold", color: "#8fa7b3", marginTop: 8 },
  section: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  detail: { marginLeft: 8, fontFamily: "Nunito_700Bold", color: "#4D6F80" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00A3FF",
    marginTop: 32,
    padding: 15,
    borderRadius: 12,
  },
  backText: { color: "#FFF", fontFamily: "Nunito_700Bold", marginLeft: 8 },
});
