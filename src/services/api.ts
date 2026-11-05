import axios, { AxiosResponse } from 'axios';

const api = axios.create({
    baseURL: 'http://10.0.2.2:3333',
});

export interface CreateEventData {
    id: string;
    dateTime: string;
    description: string;
    imageUrl: string;
    name: string;
    organizerId: string;
    position: {
        latitude: number;
        longitude: number;
    };
    volunteersNeeded: number;
    volunteersIds: string[];
}

export const authenticateUser = (
    email: string,
    password: string
): Promise<AxiosResponse> => {
    return api.post('/login', { email, password });
};

export const getEvents = (): Promise<AxiosResponse> => {
    return api.get('/events');
};

export const createEvent = (
    event: CreateEventData,
    accessToken: string
): Promise<AxiosResponse> => {
    return api.post('/events', event, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};