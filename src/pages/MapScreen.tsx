// Map screen: fetch events (prefer network, else cache), show future markers,
// footer counts, and a floating "+" button that opens the create form.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as NetInfo from "@react-native-community/netinfo";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getEvents } from "../services/api";
import { loadEventsFromCache, saveEventsToCache } from "../services/caching";
import type { EventItem } from "../types";
import mapStyle from "../../map-style.json";

export default function MapScreen() {
    const navigation = useNavigation();
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const futureEvents = useMemo(() => {
        const now = Date.now();
        return events.filter(e => Date.parse(e.dateISO) > now);
    }, [events]);

    async function fetchEventsPreferNetwork() {
        setError(null);
        setLoading(true);
        try {
            const net = await NetInfo.fetch();
            if (net.isConnected) {
                const remote = await getEvents();
                setEvents(remote);
                await saveEventsToCache(remote);
            } else {
                const cached = await loadEventsFromCache();
                if (cached) setEvents(cached);
                else setError("Offline and no cached data available.");
            }
        } catch (e: any) {
            const cached = await loadEventsFromCache();
            if (cached) {
                setEvents(cached);
                setError("Network error. Showing cached data.");
            } else {
                setError(e?.message ?? "Failed to load events.");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEventsPreferNetwork();
    }, []);

    useFocusEffect(
        useCallback(() => {
            // Re-fetch when returning from the form to include any new event.
            fetchEventsPreferNetwork();
        }, [])
    );

    const initialRegion = {
        latitude: 51.0447,
        longitude: -114.0719,
        latitudeDelta: 0.25,
        longitudeDelta: 0.25,
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text>Loading…</Text>
            </View>
        );
    }

    return (
        <View style={styles.flex}>
            <MapView
                style={styles.flex}
                provider={PROVIDER_GOOGLE}
                customMapStyle={mapStyle as any}
                initialRegion={initialRegion}
            >
                {futureEvents.map(ev => (
                    <Marker
                        key={String(ev.id ?? `${ev.latitude}-${ev.longitude}-${ev.dateISO}`)}
                        coordinate={{ latitude: ev.latitude, longitude: ev.longitude }}
                        title={ev.title}
                        description={ev.address}
                    />
                ))}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {`Events in database: ${events.length} • Future events on map: ${futureEvents.length}`}
                </Text>
                {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>

            <TouchableOpacity
                accessibilityLabel="Add Event"
                style={styles.fab}
                onPress={() => navigation.navigate("EventForm" as never)}
            >
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: 12,
        backgroundColor: "rgba(255,255,255,0.95)",
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#ddd",
    },
    footerText: { textAlign: "center" },
    error: { textAlign: "center", color: "#b00020", marginTop: 6 },
    fab: {
        position: "absolute",
        right: 16,
        bottom: 64,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#1f6feb",
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
    },
    fabText: { color: "white", fontSize: 28, lineHeight: 28 },
});
