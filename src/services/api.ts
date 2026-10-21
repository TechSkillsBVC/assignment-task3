import axios, { AxiosResponse } from 'axios';
import { Event, NewEvent } from '../types/Event';
import { getFromCache } from './caching';

const api = axios.create({
    // Before running your 'json-server', get your computer's IP address and
    // update your baseURL to `http://your_ip_address_here:3333` and then run:
    // `npx json-server --watch db.json --port 3333 --host your_ip_address_here`
    //
    // To access your server online without running json-server locally,
    // you can set your baseURL to:
    // `https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>`
    //
    // To use `my-json-server`, make sure your `db.json` is located at the repo root.

    baseURL: 'http://localhost:3333',
});

// Attach JWT access token from cache if available so authenticated endpoints work
api.interceptors.request.use(async (config) => {
    try {
        const accessToken = await getFromCache<string>('accessToken');
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
    } catch {
        // No token cached yet
    }
    return config;
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post(`/login`, { email, password });
};

/** Fetch all events from API */
export const getEvents = (): Promise<Event[]> => {
    return api.get<Event[]>(`/events`).then(({ data }) => data);
};

/** Persist a new event to the API */
export const createEvent = (event: NewEvent): Promise<AxiosResponse<Event>> => {
    return api.post(`/events`, event);
};

export default api;
