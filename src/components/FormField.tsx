import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Colors from '../constants/Colors';

interface FormFieldProps {
    label: string;
    hint?: string;
    children: React.ReactNode;
}

export default function FormField({ label, hint, children }: FormFieldProps) {
    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>
                {hint && <Text style={styles.hint}>{hint}</Text>}
            </View>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },

    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 3,
    },

    label: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        color: Colors.GREY,
    },

    hint: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 12,
        color: Colors.GREY,
    },
});
