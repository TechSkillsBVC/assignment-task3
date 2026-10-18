export interface EventPosition {
    latitude: number;
    longitude: number;
}

export interface VolunteerEvent {
    id: string;
    name: string;
    description: string;
    dateTime: string;
    imageUrl?: string;
    organizerId: string;
    position: EventPosition;
    volunteersNeeded: number;
    volunteersIds: string[];
}
