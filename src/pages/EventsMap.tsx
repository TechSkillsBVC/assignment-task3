import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View, Alert, ScrollView, RefreshControl } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarker from '../images/map-marker.png';
import mapMarkerBlue from '../images/map-marker-blue.png';
import mapMarkerGrey from '../images/map-marker-grey.png';
import { getEvents } from '../services/api';
import { Event } from '../types/Event';

export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const currentUserId = authenticationContext?.value?.id;
    const mapViewRef = useRef<MapView>(null);

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    useFocusEffect(
        useCallback(() => {
            console.log('Screen focused - reloading events');
            loadEvents();
        }, [])
    );

    const loadEvents = async (forceClear = false) => {
        console.log('=== LOADING EVENTS ===');
        if (forceClear) {
            console.log('Force clearing cache...');
            await AsyncStorage.removeItem('cachedEvents');
        }
        
        try {
            setLoading(true);
            
            // ALWAYS try API first
            const response = await getEvents();
            console.log('Fetched events from API:', response.data.length);
            
            const now = new Date();
            console.log('Current date/time:', now.toISOString());
            
            const futureEvents = response.data.filter((event) => {
                const eventDate = new Date(event.dateTime);
                const isFuture = eventDate > now;
                console.log(`${event.name}: ${event.dateTime} - Future: ${isFuture}`);
                return isFuture;
            });

            console.log('Future events after filter:', futureEvents.length);
            futureEvents.forEach((event, index) => {
                console.log(`Event ${index + 1}: ${event.name} at (${event.position.latitude}, ${event.position.longitude})`);
            });
            
            setEvents(futureEvents);
            
            // Cache the fresh data
            await AsyncStorage.setItem('cachedEvents', JSON.stringify(futureEvents));
            console.log('Events cached successfully');

            // Fit map to events
            setTimeout(() => {
                if (futureEvents.length > 0 && mapViewRef.current) {
                    console.log('Fitting map to events');
                    fitMapToEvents(futureEvents);
                }
            }, 500);

        } catch (error) {
            console.error('API Error, trying cache...', error);
            
            // Only use cache if API completely fails
            try {
                const cachedData = await AsyncStorage.getItem('cachedEvents');
                if (cachedData) {
                    const cachedEvents = JSON.parse(cachedData);
                    setEvents(cachedEvents);
                    console.log('Loaded from cache:', cachedEvents.length);
                    
                    setTimeout(() => {
                        if (cachedEvents.length > 0 && mapViewRef.current) {
                            fitMapToEvents(cachedEvents);
                        }
                    }, 500);
                } else {
                    Alert.alert('Error', 'No cached data available. Please check your connection.');
                }
            } catch (cacheError) {
                console.error('Cache error:', cacheError);
                Alert.alert('Error', 'Failed to load events.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        console.log('=== PULL TO REFRESH - CLEARING CACHE ===');
        setRefreshing(true);
        await loadEvents(true); // Force clear cache
    };

    const fitMapToEvents = (eventsList: Event[]) => {
        if (!mapViewRef.current || eventsList.length === 0) {
            console.log('Cannot fit map: no map ref or no events');
            return;
        }

        console.log('Fitting map to', eventsList.length, 'events');

        const coordinates = eventsList.map(event => ({
            latitude: event.position.latitude,
            longitude: event.position.longitude,
        }));

        mapViewRef.current.fitToCoordinates(coordinates, {
            edgePadding: {
                top: 100,
                right: 50,
                bottom: 100,
                left: 50,
            },
            animated: true,
        });
    };

    const handleMapReady = () => {
        setMapReady(true);
        if (events.length > 0) {
            setTimeout(() => fitMapToEvents(events), 1000);
        }
    };

    const getMarkerImage = useCallback(
        (event: Event) => {
            const isUserVolunteered = event.volunteersIds.includes(currentUserId || '');
            const isEventFull = event.volunteersIds.length >= event.volunteersNeeded;

            if (isUserVolunteered) {
                return mapMarkerBlue;  // Blue - user volunteered
            } else if (isEventFull) {
                return mapMarkerGrey;  // Grey - event full
            } else {
                return mapMarker;      // Orange - available
            }
        },
        [currentUserId]
    );

    const handleNavigateToEventDetails = (eventId: string) => {
        navigation.navigate('EventDetails', { eventId });
    };

    const handleNavigateToCreateEvent = () => {
        navigation.navigate('SelectLocation');
    };

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };

    const handleFitMap = () => {
        console.log('Fit map button clicked, events:', events.length);
        if (events.length > 0) {
            fitMapToEvents(events);
        } else {
            Alert.alert('No Events', 'There are no events to display on the map');
        }
    };

    const getEventsCountText = () => {
        const count = events.length;
        return `${count} event${count !== 1 ? 's' : ''} found`;
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={StyleSheet.absoluteFill}
                contentContainerStyle={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#00A3FF']}
                        tintColor="#00A3FF"
                    />
                }
            >
                <MapView
                    ref={mapViewRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.mapStyle}
                    initialRegion={{
                        latitude: 51.0447,
                        longitude: -114.0719,
                        latitudeDelta: 0.15,
                        longitudeDelta: 0.15,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    onMapReady={handleMapReady}
                    scrollEnabled={true}
                >
                   {events.map((event) => {
                        const isUserVolunteered = event.volunteersIds.includes(currentUserId || '');
                        const isEventFull = event.volunteersIds.length >= event.volunteersNeeded;
                        
                        let markerSource = mapMarker;  // Orange by default
                        if (isUserVolunteered) {
                            markerSource = mapMarkerBlue;  // Blue if volunteered
                        } else if (isEventFull) {
                            markerSource = mapMarkerGrey;  // Grey if full
                        }
                        
                        return (
                            <Marker
                                key={event.id}
                                coordinate={{
                                    latitude: event.position.latitude,
                                    longitude: event.position.longitude,
                                }}
                                onPress={() => handleNavigateToEventDetails(event.id)}
                            >
                                <Image
                                    source={markerSource}
                                    style={{ width: 48, height: 54 }}
                                    resizeMode="contain"
                                />
                            </Marker>
                        );
                    })}
                </MapView>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{getEventsCountText()}</Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: '#00A3FF' }]}
                    onPress={handleNavigateToCreateEvent}
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

            <RectButton
                style={[styles.smallButton, { 
                    position: 'absolute', 
                    top: 140, 
                    right: 24, 
                    backgroundColor: '#FF8700' 
                }]}
                onPress={handleFitMap}
            >
                <Feather name="maximize" size={20} color="#FFF" />
            </RectButton>
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
    markerImage: {
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
        elevation: 5,
    },
    footerText: {
        fontFamily: 'Nunito_700Bold',
        color: '#8fa7b3',
        fontSize: 16,
    },
    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
});
