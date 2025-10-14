import AsyncStorage from "@react-native-async-storage/async-storage";
import type { EventsResponse } from "../types";

const KEY = "events-cache-v1";

export async function saveEventsToCache(events: EventsResponse): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(events));
}

export async function loadEventsFromCache(): Promise<EventsResponse | null> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EventsResponse) : null;
}
