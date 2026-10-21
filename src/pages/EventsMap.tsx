import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Spinner from 'react-native-loading-spinner-overlay';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import { Colors } from '../constants/Colors';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import * as api from '../services/api';
import { getFromNetworkFirst } from '../services/caching';
import { Event } from '../types/Event';
import { getFutureEvents } from '../utils/events';

export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);

    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Only events that have not happened yet are displayed on the map
    const futureEvents = useMemo(() => getFutureEvents(events), [events]);

    /**
     * Consume events from endpoint using Network-First strategy:
     * If network is available, fetch and save to AsyncStorage.
     * If network fails, load from AsyncStorage cache.
     */
    const loadEvents = useCallback(async () => {
        try {
            const data = await getFromNetworkFirst<Event[]>('events', api.getEvents());
            setEvents(data || []);
        } catch (error) {
            console.warn('Unable to retrieve events from API or cache.', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Re-fetch events every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadEvents();
        }, [loadEvents])
    );

    // Zoom and frame the map around all future events
    const fitMapToEvents = useCallback(() => {
        if (!futureEvents.length || !mapViewRef.current) return;

        mapViewRef.current.fitToCoordinates(
            futureEvents.map(({ position }) => position),
            { edgePadding: MapSettings.EDGE_PADDING, animated: true }
        );
    }, [futureEvents]);

    useEffect(() => {
        fitMapToEvents();
    }, [fitMapToEvents]);

    const handleNavigateToCreateEvent = () => {
        navigation.navigate('SelectMapPosition');
    };

    const handleNavigateToEventDetails = () => {};

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapViewRef}
                provider={PROVIDER_GOOGLE}
                initialRegion={MapSettings.DEFAULT_REGION}
                style={styles.mapStyle}
                customMapStyle={customMapStyle}
                showsMyLocationButton={false}
                showsUserLocation={true}
                rotateEnabled={false}
                toolbarEnabled={false}
                moveOnMarkerPress={false}
                mapPadding={MapSettings.EDGE_PADDING}
                onLayout={fitMapToEvents}
            >
                {futureEvents.map((event) => (
                    <Marker
                        key={event.id}
                        coordinate={{
                            latitude: event.position.latitude,
                            longitude: event.position.longitude,
                        }}
                        onPress={handleNavigateToEventDetails}
                    >
                        <Image resizeMode="contain" style={styles.marker} source={mapMarkerImg} />
                    </Marker>
                ))}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{futureEvents.length} event(s) found</Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: Colors.primary }]}
                    onPress={handleNavigateToCreateEvent}
                >
                    <Feather name="plus" size={20} color="#FFF" />
                </RectButton>
            </View>

            <RectButton
                style={[styles.logoutButton, styles.smallButton, { backgroundColor: Colors.slate }]}
                onPress={handleLogout}
            >
                <Feather name="log-out" size={20} color="#FFF" />
            </RectButton>

            <Spinner
                visible={isLoading}
                textContent="Loading events..."
                overlayColor="#031A62BF"
                textStyle={styles.spinnerText}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    mapStyle: {
        ...StyleSheet.absoluteFillObject,
    },

    marker: {
        width: 48,
        height: 54,
    },

    logoutButton: {
        position: 'absolute',
        top: 70,
        right: 24,

        elevation: 3,
    },

    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,

        backgroundColor: '#FFF',
        borderRadius: 16,
        height: 56,
        paddingLeft: 24,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        elevation: 3,
    },

    footerText: {
        fontFamily: 'Nunito_700Bold',
        color: Colors.muted,
    },

    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',
    },

    spinnerText: {
        fontSize: 16,
        fontFamily: 'Nunito_700Bold',
        color: '#fff',
    },
});
