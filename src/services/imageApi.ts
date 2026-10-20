import axios from 'axios';
import { getEnvironentVariable } from '../utils';

// Images are hosted on freeimage.host (https://freeimage.host/page/api).
//
// Their documented public demo key is used when no key of your own is configured,
// so uploads work on a fresh clone without any setup. To use your own key, add
// FREEIMAGE_API_KEY to the .env file in your root folder and start the app with:
// 'FREEIMAGE_API_KEY="insert_your_api_key_here" npx expo start'
//
// When creating your app build or publishing, do not forget to run 'eas secret:push'
// command to import your secret values to EAS.

const PUBLIC_DEMO_KEY = '6d207e02198a847aa98d0a2a901485a5';

const imageApi = axios.create({
    baseURL: 'https://freeimage.host/api/1',
    headers: { 'Content-Type': 'multipart/form-data' },
});

interface UploadImageResponse {
    status_code: number;
    image?: { url: string };
    error?: { message: string };
}

/** Uploads a base64 encoded image and resolves with its public URL. */
export const uploadImage = async (imageBase64: string): Promise<string> => {
    const data = new FormData();
    data.append('key', getEnvironentVariable('FREEIMAGE_API_KEY') || PUBLIC_DEMO_KEY);
    data.append('action', 'upload');
    data.append('format', 'json');
    data.append('source', imageBase64);

    const { data: response } = await imageApi.post<UploadImageResponse>('/upload', data);

    if (response.status_code !== 200 || !response.image?.url) {
        throw new Error(response.error?.message ?? 'The image could not be uploaded.');
    }

    return response.image.url;
};
