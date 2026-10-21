import axios, { AxiosResponse } from 'axios';
import { getEnvironentVariable } from '../utils';
import { Event, NewEvent } from '../types/Event';

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

    baseURL: getEnvironentVariable('API_URL') || 'http://localhost:3333',
    timeout: 8000,
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post(`/login`, { email, password });
};

export const getEvents = (): Promise<AxiosResponse<Event[]>> => api.get('/events');

export const createEvent = (event: NewEvent): Promise<AxiosResponse<Event>> => api.post('/events', event);
