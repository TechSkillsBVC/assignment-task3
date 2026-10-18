import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, MapPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import BigButton from '../components/BigButton';
import * as MapSettings from '../constants/MapSettings';
import mapMarkerImg from '../images/map-marker.png';

export default function CreateEventLocation({ navigation }: StackScreenProps<any>) {
    const [position, setPosition] = useState<LatLng>();

    const handleMapPress = (event: MapPressEvent) => {
        setPosition(event.nativeEvent.coordinate);
    };

    const handleNext = () => {
        if (position) navigation.navigate('CreateEventForm', { position });
    };

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                initialRegion={MapSettings.DEFAULT_REGION}
                style={styles.map}
                customMapStyle={customMapStyle}
                showsUserLocation={true}
                showsMyLocationButton={false}
                rotateEnabled={false}
                toolbarEnabled={false}
                onPress={handleMapPress}
            >
                {position && (
                    <Marker coordinate={position}>
                        <Image resizeMode="contain" style={styles.marker} source={mapMarkerImg} />
                    </Marker>
                )}
            </MapView>

            <View style={styles.header}>
                <RectButton style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#00A3FF" />
                </RectButton>
                <Text style={styles.headerTitle}>Add event</Text>
                <RectButton style={styles.headerButton} onPress={() => navigation.navigate('EventsMap')}>
                    <Feather name="x" size={24} color="#E85D75" />
                </RectButton>
            </View>

            <View style={styles.nextButtonContainer}>
                <BigButton
                    label="Next"
                    color="#00A3FF"
                    disabled={!position}
                    onPress={handleNext}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F3F5',
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    marker: {
        width: 48,
        height: 54,
    },

    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 96,
        paddingTop: 32,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFFF2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 3,
    },

    headerButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 16,
        color: '#5C8599',
    },

    nextButtonContainer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,
        height: 56,
    },
});
