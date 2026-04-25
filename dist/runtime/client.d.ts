import type { CMSConfig, InferCollectionRecord } from '../config/types.js';
import { type CollectionClient } from './collections.js';
import { type MediaClient } from './media.js';
import { type CacheClient } from './cache.js';
export interface CMSBindings {
    db: D1Database;
    media?: R2Bucket;
    cache?: KVNamespace;
}
export interface CMSClientOptions extends CMSBindings {
    mediaPublicUrl?: string;
}
type CollectionClients<T extends CMSConfig> = {
    [K in keyof T['collections']]: CollectionClient<InferCollectionRecord<T['collections'][K]>>;
};
export type CMSClient<T extends CMSConfig> = CollectionClients<T> & {
    media: MediaClient;
    cache: CacheClient;
};
export declare function createCMSClient<const T extends CMSConfig>(config: T, bindings: CMSClientOptions): CMSClient<T>;
export {};
//# sourceMappingURL=client.d.ts.map