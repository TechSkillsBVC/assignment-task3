import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Colors } from '../constants/Colors';
import { formatEventDate, formatEventTime } from '../utils/events';

interface DateTimeFieldProps {
    date?: Date;
    time?: Date;
    onDateChange: (date: Date) => void;
    onTimeChange: (time: Date) => void;
}

/** Two side by side fields, each opening its own native picker. */
export default function DateTimeField({ date, time, onDateChange, onTimeChange }: DateTimeFieldProps) {
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

    return (
        <View style={styles.row}>
            <RectButton style={styles.field} onPress={() => setIsDatePickerVisible(true)}>
                <Text style={date ? styles.value : styles.placeholder}>{date ? formatEventDate(date) : 'Date'}</Text>
            </RectButton>

            <View style={styles.spacer} />

            <RectButton style={styles.field} onPress={() => setIsTimePickerVisible(true)}>
                <Text style={time ? styles.value : styles.placeholder}>{time ? formatEventTime(time) : 'Time'}</Text>
            </RectButton>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                minimumDate={new Date()}
                date={date ?? new Date()}
                onConfirm={(value) => {
                    onDateChange(value);
                    setIsDatePickerVisible(false);
                }}
                onCancel={() => setIsDatePickerVisible(false)}
            />

            <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                date={time ?? new Date()}
                onConfirm={(value) => {
                    onTimeChange(value);
                    setIsTimePickerVisible(false);
                }}
                onCancel={() => setIsTimePickerVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
    },

    spacer: {
        width: 16,
    },

    field: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderWidth: 1.4,
        borderColor: Colors.inputBorder,
        borderRadius: 16,
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
