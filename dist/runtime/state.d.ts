import type { CacheClient } from './cache.js';
export interface CacheOptions {
    ttlSeconds?: number;
    useCache?: boolean;
}
export interface StateManagerOptions {
    cache: CacheClient;
    defaultTTL?: number;
}
export interface InvalidationStrategy {
    invalidateOnCreate?: string[];
    invalidateOnUpdate?: string[];
    invalidateOnDelete?: string[];
}
type CacheGetter<T> = () => Promise<T>;
export declare class StateManager {
    private cache;
    private defaultTTL;
    private memoryCache;
    private listeners;
    constructor(options: StateManagerOptions);
    private getMemoryCache;
    private setMemoryCache;
    getOrFetch<T>(key: string, fetcher: CacheGetter<T>, options?: CacheOptions): Promise<T>;
    invalidate(key: string): Promise<void>;
    invalidatePattern(prefix: string): Promise<void>;
    set<T>(key: string, data: T, ttlSeconds?: number): Promise<void>;
    subscribe(key: string, callback: (data: unknown) => void): () => void;
    private emit;
    getCacheKey(collection: string, id?: string): string;
    invalidateCollection(collection: string): Promise<void>;
}
export declare function createStateManager(cache: CacheClient, defaultTTL?: number): StateManager;
export {};
//# sourceMappingURL=state.d.ts.map