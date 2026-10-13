import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { LatLng, Marker } from 'react-native-maps';
import mapMarkerImg from '../images/map-marker.png';

interface EventMarkerProps {
    coordinate: LatLng;
    onPress?: () => void;
}

export default function EventMarker({ coordinate, onPress }: EventMarkerProps) {
    return (
        <Marker coordinate={coordinate} onPress={onPress}>
            <Image resizeMode="contain" style={styles.image} source={mapMarkerImg} />
        </Marker>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 48,
        height: 54,
    },
});
