import type { CMSConfig, InferCollectionRecord } from '../config/types.js'
import { createCollectionClient, type CollectionClient } from './collections.js'
import { createMediaClient, type MediaClient } from './media.js'
import { createCacheClient, type CacheClient } from './cache.js'

export interface CMSBindings {
  db: D1Database
  media?: R2Bucket
  cache?: KVNamespace
}

export interface CMSClientOptions extends CMSBindings {
  mediaPublicUrl?: string
}

type CollectionClients<T extends CMSConfig> = {
  [K in keyof T['collections']]: CollectionClient<InferCollectionRecord<T['collections'][K]>>
}

export type CMSClient<T extends CMSConfig> = CollectionClients<T> & {
  media: MediaClient
  cache: CacheClient
}

export function createCMSClient<const T extends CMSConfig>(
  config: T,
  bindings: CMSClientOptions
): CMSClient<T> {
  const { db, media, cache, mediaPublicUrl = '' } = bindings

  const collectionClients = Object.fromEntries(
    Object.entries(config.collections).map(([name, definition]) => [
      name,
      createCollectionClient(db, name, definition),
    ])
  ) as CollectionClients<T>

  return {
    ...collectionClients,
    media: createMediaClient(
      media ?? (null as unknown as R2Bucket),
      mediaPublicUrl
    ),
    cache: createCacheClient(
      cache ?? (null as unknown as KVNamespace)
    ),
  }
}
