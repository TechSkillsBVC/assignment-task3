import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import mapMarker from '../images/map-marker.png';

export default function SelectLocation({ navigation }: StackScreenProps<any>) {
    const [selectedPosition, setSelectedPosition] = useState({
        latitude: 51.0447,
        longitude: -114.0719,
    });

    const handleNext = () => {
        navigation.navigate('CreateEvent', { position: selectedPosition });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <RectButton onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#00A3FF" />
                </RectButton>
                <Text style={styles.headerTitle}>Add event</Text>
                <RectButton onPress={() => navigation.goBack()}>
                    <Feather name="x" size={24} color="#FF669D" />
                </RectButton>
            </View>

            {/* Map */}
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: 51.0447,
                    longitude: -114.0719,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                onPress={(e) => setSelectedPosition(e.nativeEvent.coordinate)}
            >
                <Marker coordinate={selectedPosition}>
                    <Image
                        source={mapMarker}
                        style={{ width: 48, height: 54 }}
                        resizeMode="contain"
                    />
                </Marker>
            </MapView>

            {/* Next Button */}
            <View style={styles.footer}>
                <RectButton style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>Next</Text>
                </RectButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F3F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#D3E2E5',
    },
    headerTitle: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 16,
        color: '#8FA7B3',
    },
    map: {
        flex: 1,
    },
    footer: {
        padding: 24,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#D3E2E5',
    },
    nextButton: {
        backgroundColor: '#00A3FF',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButtonText: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 16,
        color: '#FFF',
    },
});