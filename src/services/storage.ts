import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveJSON<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadJSON<T>(key: string): Promise<T | undefined> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : undefined;
}
