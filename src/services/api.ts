import axios, { AxiosResponse } from 'axios';

const api = axios.create({
    // Fill proper local baseurl
    baseURL: 'http://0.0.0.0:0',
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post(`/login`, { email, password });
};

export const getEvents = (): Promise<AxiosResponse> => {
    return api.get('/events');
};

export const createEvent = (eventData: any): Promise<AxiosResponse> => {
    return api.post('/events', eventData);
};