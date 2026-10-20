import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import MapView, { LatLng, MapPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import BigButton from '../components/BigButton';
import PageHeader from '../components/PageHeader';
import { Colors } from '../constants/Colors';
import * as MapSettings from '../constants/MapSettings';
import mapMarkerImg from '../images/map-marker.png';

/** First step of the create-event flow: pick where the event takes place. */
export default function SelectMapPosition({ navigation }: StackScreenProps<any>) {
    const [position, setPosition] = useState<LatLng>();

    const handleSelectMapPosition = (event: MapPressEvent) => {
        setPosition(event.nativeEvent.coordinate);
    };

    const handleNextStep = () => {
        if (position) navigation.navigate('CreateEvent', { position });
    };

    return (
        <View style={styles.container}>
            <PageHeader
                title="Add event"
                onBackPress={navigation.goBack}
                onClosePress={() => navigation.navigate('EventsMap')}
            />

            <MapView
                provider={PROVIDER_GOOGLE}
                initialRegion={MapSettings.DEFAULT_REGION}
                style={styles.mapStyle}
                customMapStyle={customMapStyle}
                showsMyLocationButton={false}
                showsUserLocation={true}
                rotateEnabled={false}
                toolbarEnabled={false}
                onPress={handleSelectMapPosition}
            >
                {position && (
                    <Marker coordinate={position}>
                        <Image resizeMode="contain" style={styles.marker} source={mapMarkerImg} />
                    </Marker>
                )}
            </MapView>

            {!position && <Text style={styles.hint}>Tap the map to place the event</Text>}

            <View style={styles.footer}>
                <BigButton label="Next" color={Colors.primary} disabled={!position} onPress={handleNextStep} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    mapStyle: {
        flex: 1,
    },

    marker: {
        width: 48,
        height: 54,
    },

    hint: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 112,

        textAlign: 'center',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: Colors.slate,
    },

    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,

        flexDirection: 'row',
    },
});
