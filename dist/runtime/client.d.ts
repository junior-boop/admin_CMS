import type { CMSConfig, InferCollectionRecord } from '../config/types.js';
import { type CollectionClient } from './collections.js';
import { type CachedCollectionClient } from './cached-collections.js';
import { type MediaClient } from './media.js';
import { type CacheClient } from './cache.js';
import { type StateManager } from './state.js';
export interface CMSBindings {
    db: D1Database;
    media?: R2Bucket;
    cache?: KVNamespace;
}
export interface CMSClientOptions extends CMSBindings {
    mediaPublicUrl?: string;
    useCachedCollections?: boolean;
    cacheTTL?: number;
}
type CollectionClients<T extends CMSConfig> = {
    [K in keyof T['collections']]: CollectionClient<InferCollectionRecord<T['collections'][K]>>;
};
type CachedCollectionClients<T extends CMSConfig> = {
    [K in keyof T['collections']]: CachedCollectionClient<InferCollectionRecord<T['collections'][K]>>;
};
export type CMSClient<T extends CMSConfig> = CollectionClients<T> & {
    media: MediaClient;
    cache: CacheClient;
};
export type CachedCMSClient<T extends CMSConfig> = CachedCollectionClients<T> & {
    media: MediaClient;
    cache: CacheClient;
    state: StateManager;
};
export declare function createCMSClient<const T extends CMSConfig>(config: T, bindings: CMSClientOptions): CMSClient<T>;
export declare function createCachedCMSClient<const T extends CMSConfig>(config: T, bindings: CMSClientOptions): CachedCMSClient<T>;
export {};
//# sourceMappingURL=client.d.ts.map