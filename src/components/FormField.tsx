import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface FormFieldProps {
    label: string;
    /** Right-aligned note beside the label, e.g. "300 characters max." */
    hint?: string;
    style?: ViewStyle;
    children: ReactNode;
}

/** A labelled row in the create-event form. */
export default function FormField({ label, hint, style, children }: FormFieldProps) {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>
                {!!hint && <Text style={styles.hint}>{hint}</Text>}
            </View>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },

    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
    },

    label: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        color: Colors.muted,
    },

    hint: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 12,
        color: Colors.muted,
    },
});
