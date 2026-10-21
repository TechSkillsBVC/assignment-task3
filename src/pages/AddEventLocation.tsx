import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import ScreenHeader from '../components/ScreenHeader';
import * as MapSettings from '../constants/MapSettings';
import { RootStackParamList } from '../routes/types';

type Props = StackScreenProps<RootStackParamList, 'AddEventLocation'>;

export default function AddEventLocation({ navigation }: Props) {
    const [position, setPosition] = useState<LatLng>();

    const handleNext = () => {
        if (position) navigation.navigate('AddEventForm', { position });
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Add event" onClose={() => navigation.navigate('EventsMap')} />
            <View style={styles.mapContainer}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    initialRegion={MapSettings.DEFAULT_REGION}
                    style={StyleSheet.absoluteFillObject}
                    customMapStyle={customMapStyle}
                    onPress={({ nativeEvent }) => setPosition(nativeEvent.coordinate)}
                    showsUserLocation
                    showsMyLocationButton
                >
                    {position && <Marker coordinate={position} pinColor="#FF8700" />}
                </MapView>
                {!position && (
                    <View pointerEvents="none" style={styles.hint}>
                        <Feather name="map-pin" size={20} color="#FF8700" />
                        <Text style={styles.hintText}>Tap the map to choose the event location</Text>
                    </View>
                )}
                <RectButton
                    enabled={!!position}
                    onPress={handleNext}
                    style={[styles.nextButton, !position && styles.disabled]}
                >
                    <Text style={styles.nextText}>Next</Text>
                </RectButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F3F5' },
    mapContainer: { flex: 1 },
    hint: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFFEE',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    hintText: { marginLeft: 8, color: '#4D6F80', fontFamily: 'Nunito_600SemiBold' },
    nextButton: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 36,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00A3FF',
        elevation: 3,
    },
    disabled: { backgroundColor: '#B8D5E3' },
    nextText: { color: '#FFFFFF', fontFamily: 'Nunito_700Bold', fontSize: 16 },
});
