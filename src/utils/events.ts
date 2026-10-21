import { Event } from '../types/Event';

/** Events that already happened are not shown on the map. */
export const isPastEvent = (event: Event): boolean => new Date(event.dateTime).getTime() < Date.now();

/** Filter out past events, returning only events happening in the future. */
export const getFutureEvents = (events: Event[]): Event[] => events.filter((event) => !isPastEvent(event));

/** e.g. "Oct 20, 2026" */
export const formatEventDate = (dateTime: Date): string =>
    new Date(dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** e.g. "11:00 AM" */
export const formatEventTime = (dateTime: Date): string =>
    new Date(dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
