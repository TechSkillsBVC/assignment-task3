import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { LatLng, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import BigButton from '../components/BigButton';
import EventMarker from '../components/EventMarker';
import * as Colors from '../constants/Colors';
import * as MapSettings from '../constants/MapSettings';
import { AppStackParamList } from '../types/Navigation';

export default function SelectLocation({ navigation }: StackScreenProps<AppStackParamList, 'SelectLocation'>) {
    const [position, setPosition] = useState<LatLng>();

    const handleNext = () => {
        navigation.navigate('EventForm', { position: position as LatLng });
    };

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                initialRegion={MapSettings.DEFAULT_REGION}
                style={styles.mapStyle}
                customMapStyle={customMapStyle}
                rotateEnabled={false}
                toolbarEnabled={false}
                onPress={(event) => setPosition(event.nativeEvent.coordinate)}
            >
                {position && <EventMarker coordinate={position} />}
            </MapView>

            {position && <BigButton style={styles.nextButton} label="Next" color={Colors.BLUE} onPress={handleNext} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    mapStyle: {
        ...StyleSheet.absoluteFillObject,
    },

    nextButton: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,
    },
});
