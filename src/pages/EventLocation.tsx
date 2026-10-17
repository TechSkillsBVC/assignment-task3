
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, LatLng, MapPressEvent, PROVIDER_GOOGLE } from 'react-native-maps';
import * as MapSettings from '../constants/MapSettings';

export default function EventLocation({ navigation }: StackScreenProps<any>) {
    const [position, setPosition] = useState<LatLng>();

    const handleSelectLocation = (event: MapPressEvent) => {
        setPosition(event.nativeEvent.coordinate);
    };

    const handleNext = () => {
        if (position) {
            navigation.navigate('CreateEvent', { position });
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={MapSettings.DEFAULT_REGION}
                onPress={handleSelectLocation}
            >
                {position && <Marker coordinate={position} />}
            </MapView>

            <RectButton
                style={[styles.button, !position && styles.disabled]}
                enabled={!!position}
                onPress={handleNext}
            >
                <Text style={styles.buttonText}>Next</Text>
            </RectButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    button: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
        height: 56,
        backgroundColor: '#00A3FF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },

    disabled: {
        backgroundColor: '#8fa7b3',
    },

    buttonText: {
        color: '#FFF',
        fontFamily: 'Nunito_700Bold',
    },
});
