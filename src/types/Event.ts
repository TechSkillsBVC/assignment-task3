import { LatLng } from 'react-native-maps';

export interface Event {
    id: string;
    name: string;
    description: string;
    dateTime: Date;
    organizerId: string;
    imageUrl?: string;
    position: LatLng;
    volunteersNeeded: number;
    volunteersIds: string[];
}

/** What the create-event form sends to the API. The id is generated client side. */
export type NewEvent = Omit<Event, 'dateTime'> & { dateTime: string };
