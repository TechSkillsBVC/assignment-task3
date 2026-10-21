import { Event } from '../types/Event';

export const getFutureEvents = (events: Event[], now = new Date()): Event[] =>
    events.filter((event) => {
        const eventDate = new Date(event.dateTime);
        return !Number.isNaN(eventDate.getTime()) && eventDate.getTime() > now.getTime();
    });

export const isPositiveWholeNumber = (value: string): boolean => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0;
};
