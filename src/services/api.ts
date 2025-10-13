import axios, { AxiosResponse } from 'axios';

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

    baseURL: 'http://10.0.0.151:3333',
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post(`/login`, { email, password });
};



// same format as db.json
export type EventDTO = {
  id: string;
  name: string;
  description?: string;
  dateTime: string; 
  imageUrl?: string;
  position: {
    latitude: number;
    longitude: number;
  };
  volunteersNeeded?: number;
  volunteersIds?: string[];
};

// GET /events
export async function getEvents(): Promise<EventDTO[]> {
  const res = await api.get<EventDTO[]>('/events');
  return res.data;
}

// new event for POST 
export type NewEventDTO = {
  name: string;
  description: string;
  dateTime: string; 
  position: { latitude: number; longitude: number };
  imageUrl: string;
  organizerId: string;
  volunteersNeeded: number;
  volunteersIds: string[];
};

// POST /events
export async function createEvent(payload: NewEventDTO): Promise<EventDTO> {
  const res = await api.post<EventDTO>('/events', payload);
  return res.data;
}


export default api;