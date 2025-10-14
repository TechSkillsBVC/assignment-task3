
export type EventItem = {
    id?: string | number;
    title: string;
    description: string;
    dateISO: string;           // ISO 8601 date-time string
    latitude: number;          // decimal degrees
    longitude: number;         // decimal degrees
    address: string;
    imageUrl: string;          // uploaded image URL
    imageName: string;         // original filename (best-effort)
    imageSize: number;         // bytes
};

export type EventsResponse = EventItem[];
