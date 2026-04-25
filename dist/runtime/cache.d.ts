export interface CacheClient {
    get<T = unknown>(key: string): Promise<T | null>;
    set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    invalidate(key: string): Promise<void>;
    invalidatePattern(prefix: string): Promise<void>;
}
export declare function createCacheClient(kv: KVNamespace): CacheClient;
//# sourceMappingURL=cache.d.ts.map