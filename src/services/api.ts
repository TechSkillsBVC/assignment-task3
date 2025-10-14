

//const api = axios.create({
//    // Before running your 'json-server', get your computer's IP address and
//    // update your baseURL to `http://your_ip_address_here:3333` and then run:
//    // `npx json-server --watch db.json --port 3333 --host your_ip_address_here`
//    //
//    // To access your server online without running json-server locally,
//    // you can set your baseURL to:
//    // `https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>`
//    //
//    // To use `my-json-server`, make sure your `db.json` is located at the repo root.

//    baseURL: 'http://0.0.0.0:3333',
//});

//export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
//    return api.post(`/login`, { email, password });
//};

// REST API access for events.
// Set baseURL to your json-server or remote endpoint.
import axios, { AxiosResponse } from 'axios';
import type { EventItem, EventsResponse } from "../types";

export const api = axios.create({
    baseURL: "http://0.0.0.0:3333", // change for your environment
    timeout: 15000,
});

export async function getEvents(): Promise<EventsResponse> {
    const { data } = await api.get<EventsResponse>("/events");
    return data;
}

export async function createEvent(payload: EventItem): Promise<EventItem> {
    const { data } = await api.post<EventItem>("/events", payload);
    return data;
}
