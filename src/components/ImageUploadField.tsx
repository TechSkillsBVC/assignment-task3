import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { Colors } from '../constants/Colors';
import { UploadedImage } from '../types/UploadedImage';
import { formatBytes } from '../utils';

interface ImageUploadFieldProps {
    image?: UploadedImage;
    isUploading: boolean;
    onPickPress: () => void;
    onRemovePress: () => void;
}

/**
 * Image picker component matching Figma design:
 * - Empty state: Dashed box with '+' icon
 * - Uploaded state: White card with thumbnail, filename, filesize, and 'x' remove button
 */
export default function ImageUploadField({
    image,
    isUploading,
    onPickPress,
    onRemovePress,
}: ImageUploadFieldProps) {
    if (isUploading) {
        return (
            <View style={[styles.box, styles.uploadingBox]}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.uploadingText}>Uploading image...</Text>
            </View>
        );
    }

    if (image) {
        return (
            <View style={[styles.box, styles.filledBox]}>
                <Image source={{ uri: image.uri }} style={styles.thumbnail} />

                <View style={styles.details}>
                    <Text style={styles.fileName} numberOfLines={1}>
                        {image.name}
                    </Text>
                    <Text style={styles.fileSize}>{formatBytes(image.size)}</Text>
                </View>

                <BorderlessButton onPress={onRemovePress} style={styles.removeBtn}>
                    <Feather name="x" size={22} color={Colors.danger} />
                </BorderlessButton>
            </View>
        );
    }

    return (
        <RectButton style={[styles.box, styles.emptyBox]} onPress={onPickPress}>
            <Feather name="plus" size={24} color={Colors.teal} />
        </RectButton>
    );
}

const styles = StyleSheet.create({
    box: {
        height: 72,
        borderRadius: 8,
        paddingHorizontal: 16,

        flexDirection: 'row',
        alignItems: 'center',
    },

    emptyBox: {
        borderWidth: 1.4,
        borderStyle: 'dashed',
        borderColor: Colors.dashedBorder,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
    },

    filledBox: {
        backgroundColor: Colors.surface,
        borderWidth: 1.4,
        borderColor: Colors.inputBorder,
    },

    uploadingBox: {
        backgroundColor: Colors.surface,
        borderWidth: 1.4,
        borderColor: Colors.inputBorder,
        justifyContent: 'center',
    },

    uploadingText: {
        marginLeft: 12,
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: Colors.primary,
    },

    thumbnail: {
        width: 52,
        height: 52,
        borderRadius: 6,
        backgroundColor: Colors.inputBorder,
    },

    details: {
        flex: 1,
        marginHorizontal: 14,
    },

    fileName: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: Colors.slate,
    },

    fileSize: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 12,
        color: Colors.muted,
        marginTop: 2,
    },

    removeBtn: {
        padding: 6,
    },
});
