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
 * Empty state is a dashed box with a '+'. Once an image is uploaded it shows the
 * thumbnail, file name and size, with a button to remove it.
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
                <Text style={styles.uploadingText}>Uploading...</Text>
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

                <BorderlessButton onPress={onRemovePress}>
                    <Feather name="x" size={24} color={Colors.danger} />
                </BorderlessButton>
            </View>
        );
    }

    return (
        <RectButton style={[styles.box, styles.emptyBox]} onPress={onPickPress}>
            <Feather name="plus" size={24} color={Colors.primary} />
        </RectButton>
    );
}

const styles = StyleSheet.create({
    box: {
        minHeight: 96,
        borderRadius: 16,
        paddingHorizontal: 16,

        flexDirection: 'row',
        alignItems: 'center',
    },

    emptyBox: {
        borderWidth: 1.4,
        borderStyle: 'dashed',
        borderColor: Colors.dashedBorder,
        justifyContent: 'center',
    },

    filledBox: {
        backgroundColor: Colors.highlight,
        borderWidth: 1,
        borderColor: Colors.dashedBorder,
    },

    uploadingBox: {
        backgroundColor: Colors.highlight,
        justifyContent: 'center',
    },

    uploadingText: {
        marginLeft: 12,
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: Colors.primary,
    },

    thumbnail: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: Colors.inputBorder,
    },

    details: {
        flex: 1,
        marginHorizontal: 16,
    },

    fileName: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: Colors.body,
    },

    fileSize: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 13,
        color: Colors.muted,
        marginTop: 2,
    },
});
