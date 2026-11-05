import React, { useEffect } from 'react';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import {
    ActivityIndicator,
    StyleSheet,
    View,
} from 'react-native';

import {
    useFonts,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

import AppStack from './src/routes/AppStack';
import { StatusBar } from 'expo-status-bar';

export default function App() {
    const [fontsLoaded, fontError] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
        Nunito_800ExtraBold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            console.log('NUNITO_FONTS_LOADED');
        }

        if (fontError) {
            console.error('NUNITO_FONTS_ERROR:', fontError);
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#00A3FF" />
            </View>
        );
    }

    return (
        <>
            <StatusBar animated translucent style="dark" />

            <ActionSheetProvider>
                <AppStack />
            </ActionSheetProvider>
        </>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#031A62',
    },
});