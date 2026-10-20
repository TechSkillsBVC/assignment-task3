export interface UploadedImage {
    /** Local file uri, used for the thumbnail. */
    uri: string;
    /** Public url returned by the image hosting service. */
    url: string;
    name: string;
    size: number;
}
