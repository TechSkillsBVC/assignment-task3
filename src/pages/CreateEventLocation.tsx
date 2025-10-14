import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import mapMarkerImg from '../images/map-marker.png';
import { StackScreenProps } from '@react-navigation/stack';
import BackHeader from '../components/BackHeader';

export default function CreateEventSelectLocation({ navigation }: StackScreenProps<any>) {
  // set up map reference to control map if needed
  const mapRef = useRef<MapView>(null);

  // store pin with the selected coordinates
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(null);

  // run everytime user presses map and set pin
  const onMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPin({ latitude, longitude });
  };

  // move to event details page and pass the location coords
  const onNext = () => {
    if (!pin) return;
    navigation.navigate('CreateEventDetails', { position: pin });
  };

  return (
    <View style={styles.container}>
      {/* imported header componmen */}
      <BackHeader title="Select Location" />

      {/* main map area */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={MapSettings.DEFAULT_REGION}
        customMapStyle={customMapStyle}
        onPress={onMapPress}
        showsUserLocation
        mapPadding={MapSettings.EDGE_PADDING}
      >
        {/* show marker only if user selected a location */}
        {pin && (
          <Marker coordinate={pin}>
            <Image source={mapMarkerImg} style={{ width: 48, height: 54 }} resizeMode="contain" />
          </Marker>
        )}
      </MapView>

      {/* btn disabled until location picked */}
      <View style={styles.footer}>
        <RectButton
          style={[styles.btn, pin ? styles.btnPrimary : styles.btnDisabled]}
          enabled={!!pin}
          onPress={onNext}
        >
          <Text style={styles.btnText}>Next</Text>
        </RectButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
    backgroundColor: 'transparent',
  },
  btn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#00A3FF' },
  btnDisabled: { backgroundColor: '#C8D1D9' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
