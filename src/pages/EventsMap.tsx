import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Image, StyleSheet, Text, View, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';

import { useFocusEffect } from '@react-navigation/native';


// events api + caching
import { getEvents, type EventDTO } from '../services/api';
import { getFromNetworkFirst, setInCache, getFromCache } from '../services/caching';

export default function EventsMap(props: StackScreenProps<any>) {
  const { navigation } = props;
  const authenticationContext = useContext(AuthenticationContext);
  const mapViewRef = useRef<MapView>(null);

  // ALL events (no future filter)
  const [events, setEvents] = useState<EventDTO[]>([]);

  // normalize coords from db.json shape
  const toCoords = (e: EventDTO) => ({
    latitude: e.position?.latitude,
    longitude: e.position?.longitude,
  });

  // loade network first then cache fallback (store and display events)
  const loadEvents = useCallback(async () => {
    try {
      // get list of events from API
      const fresh = await getFromNetworkFirst<EventDTO[]>('events', getEvents());
      // display every event in db
      setEvents(fresh);
      // store the same list locally for when offline                   
      await setInCache('eventsAll', fresh); 

    // Show future events only   
    //   const now = Date.now(); // current time in ms
    // const futureOnly = fresh.filter(event => Date.parse(event.dateTime) > now);
    // setEvents(futureOnly);                        // only show future ones
    // await setInCache('eventsFuture', futureOnly); // store this filtered list in cache
    } catch {
      try {
        //if network API call fail load from cache
        const cached = await getFromCache<EventDTO[]>('eventsAll');
        setEvents(cached);
      } catch {
        // no cache available let user know
        Alert.alert('Offline', 'No cached events available yet.');
      }
    }
  }, []);

  // reload events when screen is focused again
  useFocusEffect(
  React.useCallback(() => {
    loadEvents();
  }, [loadEvents])
);

  // fit map to current markers
  useEffect(() => {
    if (!events.length) return;
    const coords = events.map(toCoords).filter(c => !!c.latitude && !!c.longitude);
    if (!coords.length) return;
    mapViewRef.current?.fitToCoordinates(coords, {
      edgePadding: MapSettings.EDGE_PADDING,
      animated: false,
    });
  }, [events]);

  // handler for navigating to the event location screen
  const handleNavigateToCreateEvent = () => {
    navigation.navigate('CreateEventLocation');
  };

  const handleNavigateToEventDetails = () => {

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
      >
        {events.map((event) => {
          const coord = toCoords(event);
          if (!coord.latitude || !coord.longitude) return null;
          return (
            <Marker
              key={event.id}
              coordinate={coord}
              onPress={handleNavigateToEventDetails}
            >
              <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={mapMarkerImg} />
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.footer}>
        {/* show actual count of ALL events */}
        <Text style={styles.footerText}>{events.length} event(s) found</Text>
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
    color: '#8fa7b3',
  },
  smallButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
