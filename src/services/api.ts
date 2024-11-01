import axios, { AxiosResponse, AxiosError } from 'axios';
import { Event } from '../types/Event';

const api = axios.create({
  baseURL: 'http://192.168.137.68:3333', 
});

// Authentication function to authenticate a user
export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
  return api.post('/login', { email, password });
};

// Function to fetch events from the server
export const getEvents = (): Promise<Event[]> => {
  return api.get('/eventsData').then((response) => response.data);
};

// Function to create a new event
export const createEvent = async (eventData: Partial<Event>): Promise<AxiosResponse> => {
  try {
    return await api.post('/eventsData', eventData);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error creating event:', axiosError.response?.data || axiosError.message);
    throw axiosError; 
  }
};

// Function to upload an image
export const uploadImage = async (imageUri: string): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);

  try {
    return await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Image upload error:', axiosError.response?.data || axiosError.message);
    console.error('Full error object:', JSON.stringify(axiosError, null, 2));
    throw axiosError;
  }
};