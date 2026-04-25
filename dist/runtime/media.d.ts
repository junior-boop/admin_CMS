export interface UploadOptions {
    key?: string;
    contentType?: string;
    metadata?: Record<string, string>;
}
export interface MediaObject {
    key: string;
    url: string;
    size: number;
    contentType: string;
    uploadedAt: string;
}
export interface MediaClient {
    upload(file: ReadableStream | ArrayBuffer | Blob, options?: UploadOptions): Promise<MediaObject>;
    getUrl(key: string): string;
    delete(key: string): Promise<void>;
    list(prefix?: string): Promise<Pick<MediaObject, 'key' | 'size' | 'uploadedAt'>[]>;
}
export declare function createMediaClient(bucket: R2Bucket, publicUrlBase: string): MediaClient;
//# sourceMappingURL=media.d.ts.map