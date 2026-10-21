import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import { getEvents } from '../services/API';

const STORAGE_KEY = '@events_cache';

export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);
    const [events, setEvents] = useState<any[]>([]);

    // Automatically fetch / load cache when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadEvents();
        }, [])
    );

    const loadEvents = async () => {
        const netState = await NetInfo.fetch();
        let fetchedData = [];

        if (netState.isConnected) {
            try {
                // 1) Fetch data from internet
                const response = await getEvents();
                fetchedData = response.data;
                // 2) Save in cache
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedData));
            } catch (error) {
                console.warn('API fetch failed, consuming from cache:', error);
                // 3) Consume from cache as fallback
                fetchedData = await getCachedEvents();
            }
        } else {
            // Offline: Consume from cache
            fetchedData = await getCachedEvents();
        }

        // Filter for future events
        const now = new Date();
        const futureEvents = fetchedData.filter((event: any) => 
            event.dateTime ? new Date(event.dateTime) >= now : true
        );

        setEvents(futureEvents);
    };

    const getCachedEvents = async () => {
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        return cached ? JSON.parse(cached) : [];
    };

    const handleNavigateToCreateEvent = (coordinate?: { latitude: number; longitude: number }) => {
        navigation.navigate('CreateEvent', coordinate ? coordinate : undefined);
    };

    const handleNavigateToEventDetails = () => {
        // Optional navigation to details
    };

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
                onPress={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    handleNavigateToCreateEvent({ latitude, longitude });
                }}
            >
                {events.map((event) => {
                    if (!event.position) return null;
                    return (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.position.latitude,
                                longitude: event.position.longitude,
                            }}
                            onPress={handleNavigateToEventDetails}
                        >
                            <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={mapMarkerImg} />
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{events.length} event(s) found</Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: '#00A3FF' }]}
                    onPress={() => handleNavigateToCreateEvent()}
                >
                    <Feather name="plus" size={20} color="#FFF" />
                </RectButton>
            </View>

            <RectButton
                style={[styles.logoutButton, styles.smallButton, { backgroundColor: '#4D6F80' }]}
                onPress={handleLogout}
            >
                <Feather name="log-out" size={20} color="#FFF" />
            </RectButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { ...StyleSheet.absoluteFillObject, flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
    mapStyle: { ...StyleSheet.absoluteFillObject },
    logoutButton: { position: 'absolute', top: 70, right: 24, elevation: 3 },
    footer: { position: 'absolute', left: 24, right: 24, bottom: 40, backgroundColor: '#FFF', borderRadius: 16, height: 56, paddingLeft: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3 },
    footerText: { fontFamily: 'Nunito_700Bold', color: '#8fa7b3' },
    smallButton: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
});