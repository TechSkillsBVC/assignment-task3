import axios from 'axios';
import Constants from 'expo-constants';

/**
 * Uploads a base64 encoded image to ImgBB or FreeImage.host and resolves with the public URL.
 * Checks for IMGBB_API_KEY or FREEIMAGE_API_KEY in Expo config or environment variables.
 */
export const uploadImage = async (imageBase64: string): Promise<string> => {
    const imgbbKey = Constants.expoConfig?.extra?.IMGBB_API_KEY || process.env.IMGBB_API_KEY;
    const freeimageKey = Constants.expoConfig?.extra?.FREEIMAGE_API_KEY || process.env.FREEIMAGE_API_KEY;

    if (imgbbKey) {
        const formData = new FormData();
        formData.append('image', imageBase64);

        const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            params: { key: imgbbKey },
        });

        if (response.data?.data?.url) {
            return response.data.data.url;
        }
    }

    if (freeimageKey) {
        const formData = new FormData();
        formData.append('key', freeimageKey);
        formData.append('action', 'upload');
        formData.append('format', 'json');
        formData.append('source', imageBase64);

        const response = await axios.post('https://freeimage.host/api/1/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data?.image?.url) {
            return response.data.image.url;
        }
    }

    throw new Error('Image API key not found. Please set IMGBB_API_KEY in your .env file or environment.');
};
