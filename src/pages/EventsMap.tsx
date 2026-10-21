import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import { RootStackParamList } from '../routes/types';
import * as api from '../services/api';
import { getFromCache, setInCache } from '../services/caching';
import { Event } from '../types/Event';
import { getFutureEvents } from '../utils/events';

type Props = StackScreenProps<RootStackParamList, 'EventsMap'>;
const EVENTS_CACHE_KEY = 'events';

export default function EventsMap({ navigation }: Props) {
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [userPosition, setUserPosition] = useState<LatLng>();
    const [mapReady, setMapReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [usingCache, setUsingCache] = useState(false);

    const loadEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.getEvents();
            await setInCache(EVENTS_CACHE_KEY, response.data);
            setEvents(getFutureEvents(response.data));
            setUsingCache(false);
        } catch (networkError) {
            try {
                const cachedEvents = await getFromCache<Event[]>(EVENTS_CACHE_KEY);
                setEvents(getFutureEvents(cachedEvents));
                setUsingCache(true);
            } catch (cacheError) {
                setEvents([]);
                setUsingCache(false);
                Alert.alert('Events unavailable', 'Connect to the internet and make sure the events API is running.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => void loadEvents(), [loadEvents]));

    useEffect(() => {
        let active = true;
        const getLocation = async () => {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (!permission.granted) return;
            const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            if (active) setUserPosition({ latitude: current.coords.latitude, longitude: current.coords.longitude });
        };
        getLocation().catch(() => undefined);
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!mapReady || isLoading) return;
        const coordinates = events.map(({ position }) => position);
        if (userPosition) coordinates.push(userPosition);
        if (coordinates.length > 0) {
            requestAnimationFrame(() => mapViewRef.current?.fitToCoordinates(coordinates, {
                edgePadding: MapSettings.EDGE_PADDING,
                animated: true,
            }));
        }
    }, [events, userPosition, mapReady, isLoading]);

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['userInfo', 'accessToken']);
        authenticationContext?.setValue(undefined);
        navigation.replace('Login');
    };

    const showEvent = (event: Event) => {
        Alert.alert(event.name, `${new Date(event.dateTime).toLocaleString()}\n\n${event.description}`);
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
                showsUserLocation
                rotateEnabled={false}
                toolbarEnabled={false}
                moveOnMarkerPress={false}
                mapPadding={MapSettings.EDGE_PADDING}
                onMapReady={() => setMapReady(true)}
            >
                {events.map((event) => (
                    <Marker key={event.id} coordinate={event.position} onPress={() => showEvent(event)}>
                        <Image resizeMode="contain" style={styles.marker} source={mapMarkerImg} />
                    </Marker>
                ))}
            </MapView>

            {usingCache && (
                <View style={styles.offlineBanner}>
                    <Feather name="wifi-off" size={15} color="#FFFFFF" />
                    <Text style={styles.offlineText}>Offline · showing saved events</Text>
                </View>
            )}

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {isLoading ? 'Loading events…' : `${events.length} event${events.length === 1 ? '' : 's'} found`}
                </Text>
                <RectButton style={[styles.smallButton, styles.addButton]} onPress={() => navigation.navigate('AddEventLocation')}>
                    <Feather name="plus" size={20} color="#FFF" />
                </RectButton>
            </View>
            <RectButton style={[styles.logoutButton, styles.smallButton]} onPress={handleLogout}>
                <Feather name="log-out" size={20} color="#FFF" />
            </RectButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { ...StyleSheet.absoluteFillObject, flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
    mapStyle: { ...StyleSheet.absoluteFillObject },
    marker: { width: 48, height: 54 },
    logoutButton: { position: 'absolute', top: 70, right: 24, elevation: 3, backgroundColor: '#4D6F80' },
    footer: {
        position: 'absolute', left: 24, right: 24, bottom: 40, backgroundColor: '#FFF', borderRadius: 16,
        height: 56, paddingLeft: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3,
    },
    footerText: { fontFamily: 'Nunito_700Bold', color: '#8FA7B3' },
    smallButton: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    addButton: { backgroundColor: '#00A3FF' },
    offlineBanner: {
        position: 'absolute', top: 70, left: 24, backgroundColor: '#4D6F80', borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center',
    },
    offlineText: { color: '#FFFFFF', fontFamily: 'Nunito_600SemiBold', marginLeft: 7, fontSize: 12 },
});
