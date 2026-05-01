import { createCollectionClient } from './collections.js';
import { createCachedCollectionClient } from './cached-collections.js';
import { createMediaClient } from './media.js';
import { createCacheClient } from './cache.js';
import { createStateManager } from './state.js';
export function createCMSClient(config, bindings) {
    const { db, media, cache, mediaPublicUrl = '' } = bindings;
    const collectionClients = Object.fromEntries(Object.entries(config.collections).map(([name, definition]) => [
        name,
        createCollectionClient(db, name, definition),
    ]));
    return {
        ...collectionClients,
        media: createMediaClient(media ?? null, mediaPublicUrl),
        cache: createCacheClient(cache ?? null),
    };
}
export function createCachedCMSClient(config, bindings) {
    const { db, media, cache, mediaPublicUrl = '', cacheTTL = 300 } = bindings;
    const cacheClient = createCacheClient(cache ?? null);
    const stateManager = createStateManager(cacheClient, cacheTTL);
    const collectionClients = Object.fromEntries(Object.entries(config.collections).map(([name, definition]) => [
        name,
        createCachedCollectionClient(db, stateManager, name, definition),
    ]));
    return {
        ...collectionClients,
        media: createMediaClient(media ?? null, mediaPublicUrl),
        cache: cacheClient,
        state: stateManager,
    };
}
//# sourceMappingURL=client.js.map