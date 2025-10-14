import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { RectButton } from "react-native-gesture-handler";
import { StackScreenProps } from "@react-navigation/stack";
import mapMarkerImg from "../images/map-marker.png";
import customMapStyle from "../../map-style.json";
import * as MapSettings from "../constants/MapSettings";
import { api } from "../services/api";

interface Event {
  id: string;
  name: string;
  about: string;
  position: { latitude: number; longitude: number };
}

export default function EventsMap({ navigation }: StackScreenProps<any>) {
  const [events, setEvents] = useState<Event[]>([]);
  const mapRef = useRef<MapView>(null);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get("/events");
      setEvents(data);
      await AsyncStorage.setItem("@events", JSON.stringify(data));
    } catch {
      const cached = await AsyncStorage.getItem("@events");
      if (cached) {
        setEvents(JSON.parse(cached));
      }
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchEvents);
    fetchEvents();
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={MapSettings.DEFAULT_REGION}
        style={styles.mapStyle}
        customMapStyle={customMapStyle}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={event.position}
            onPress={() => navigation.navigate("EventDetails", { event })}
          >
            <Image source={mapMarkerImg} style={{ width: 48, height: 54 }} />
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{events.length} event(s) found</Text>
        <RectButton
          style={[styles.smallButton, { backgroundColor: "#00A3FF" }]}
          onPress={() => navigation.navigate("CreateEvent")}
        >
          <Feather name="plus" size={20} color="#FFF" />
        </RectButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  mapStyle: { ...StyleSheet.absoluteFillObject },
  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 40,
    backgroundColor: "#FFF",
    borderRadius: 16,
    height: 56,
    paddingLeft: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontFamily: "Nunito_700Bold", color: "#8fa7b3" },
  smallButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
