import { Feather } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

type Props = {
    title: string;
    onClose: () => void;
};

export default function ScreenHeader({ title, onClose }: Props) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.spacer} />
                <Text style={styles.title}>{title}</Text>
                <RectButton onPress={onClose} style={styles.closeButton}>
                    <Feather name="x" size={22} color="#FF7A7A" />
                </RectButton>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#FFFFFF' },
    header: {
        height: 58,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#DCE8EC',
    },
    spacer: { width: 44 },
    title: { color: '#4D6F80', fontFamily: 'Nunito_700Bold', fontSize: 18 },
    closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
