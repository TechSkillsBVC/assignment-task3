import axios, { AxiosResponse } from 'axios';
import RNFS from 'react-native-fs';

export const imageApi = axios.create({
  baseURL: 'https://freeimage.host/api/1',
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const uploadImage = async (imageUri: string): Promise<AxiosResponse> => {
  try {
    const imageBase64 = await RNFS.readFile(imageUri, 'base64');

    const formData = new FormData();
    formData.append('source', `data:image/jpeg;base64,${imageBase64}`); 
    formData.append('action', 'upload');
    formData.append('key', '**');
    formData.append('format', 'json');

    const response = await imageApi.post('/upload', formData);

    if (response.data.status_code === 200) {
      console.log('Image uploaded successfully:', response.data.image.display_url);
      return response;
    } else {
      throw new Error(`Upload failed: ${response.data.status_txt}`);
    }
  } catch (error) {
    console.error('Image upload error:', (error as any).response?.data || (error as any).message);
    throw error;
  }
};