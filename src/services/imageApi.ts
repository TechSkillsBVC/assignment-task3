// Image upload utility.
// Uses ImgBB (https://api.imgbb.com/1/upload).
// Provide IMGBB_API_KEY at runtime; npx expo start

import * as FileSystem from "expo-file-system";

type UploadResult = {
    imageUrl: string;
    fileName: string;
    fileSize: number;
};

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";

export async function uploadImageAsync(localUri: string, apiKey: string): Promise<UploadResult> {
    const info = await FileSystem.getInfoAsync(localUri);
    const fileName = localUri.split("/").pop() ?? "image.jpg";
    const fileSize = info.size ?? 0;

    const form = new FormData();
    form.append("key", apiKey);
    form.append("image", {
        // @ts-ignore RN FormData typing
        uri: localUri,
        name: fileName,
        type: "image/jpeg",
    });

    const res = await fetch(IMGBB_ENDPOINT, { method: "POST", body: form as any });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const json = await res.json();
    const imageUrl = json?.data?.url as string;
    if (!imageUrl) throw new Error("Upload failed: no URL returned");
    return { imageUrl, fileName, fileSize };
}
