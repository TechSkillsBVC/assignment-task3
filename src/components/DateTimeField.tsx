import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Colors } from '../constants/Colors';

interface DateTimeFieldProps {
    date?: Date;
    time?: Date;
    onDateChange: (date: Date) => void;
    onTimeChange: (time: Date) => void;
}

/** Formats date and time into e.g. "Oct 20, 2023 11:00 AM" to match Figma */
const formatFullDateTime = (date: Date, time: Date): string => {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
};

/**
 * Single full-width field matching the Figma design.
 * Tapping opens native date picker followed by time picker.
 */
export default function DateTimeField({ date, time, onDateChange, onTimeChange }: DateTimeFieldProps) {
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

    const handlePress = () => {
        setIsDatePickerVisible(true);
    };

    const handleDateConfirm = (selectedDate: Date) => {
        onDateChange(selectedDate);
        setIsDatePickerVisible(false);
        // Automatically open time picker after choosing the date
        setTimeout(() => {
            setIsTimePickerVisible(true);
        }, 300);
    };

    const handleTimeConfirm = (selectedTime: Date) => {
        onTimeChange(selectedTime);
        setIsTimePickerVisible(false);
    };

    const displayText = date && time ? formatFullDateTime(date, time) : '';

    return (
        <>
            <RectButton style={styles.field} onPress={handlePress}>
                <Text style={displayText ? styles.value : styles.placeholder}>
                    {displayText || 'Select Date and Time'}
                </Text>
            </RectButton>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                minimumDate={new Date()}
                date={date ?? new Date()}
                onConfirm={handleDateConfirm}
                onCancel={() => setIsDatePickerVisible(false)}
            />

            <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                date={time ?? new Date()}
                onConfirm={handleTimeConfirm}
                onCancel={() => setIsTimePickerVisible(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    field: {
        backgroundColor: Colors.surface,
        borderWidth: 1.4,
        borderColor: Colors.inputBorder,
        borderRadius: 8,
        height: 56,

        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    value: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        color: Colors.body,
    },

    placeholder: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        color: Colors.muted,
    },
});
