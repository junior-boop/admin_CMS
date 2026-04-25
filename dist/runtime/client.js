import { createCollectionClient } from './collections.js';
import { createMediaClient } from './media.js';
import { createCacheClient } from './cache.js';
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
//# sourceMappingURL=client.js.map