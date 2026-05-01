import type { CMSConfig, InferCollectionRecord } from '../config/types.js'
import type { CMSClient, CachedCMSClient } from '../runtime/client.js'
import type { FindOptions } from '../runtime/collections.js'

type AnyCMSClient<T extends CMSConfig> = CMSClient<T> | CachedCMSClient<T>

function asCached<T extends CMSConfig>(cms: AnyCMSClient<T>): CachedCMSClient<T> {
  return cms as unknown as CachedCMSClient<T>
}

export async function getCollection<
  T extends CMSConfig,
  K extends keyof T['collections'] & string,
>(
  cms: AnyCMSClient<T>,
  collection: K,
  options?: FindOptions
): Promise<InferCollectionRecord<T['collections'][K]>[]> {
  const client = cms[collection]
  if (!client) throw new Error(`Collection "${collection}" not found in CMS config`)
  return client.find(options)
}

export async function getEntry<
  T extends CMSConfig,
  K extends keyof T['collections'] & string,
>(
  cms: AnyCMSClient<T>,
  collection: K,
  id: number
): Promise<InferCollectionRecord<T['collections'][K]> | null> {
  const client = cms[collection]
  if (!client) throw new Error(`Collection "${collection}" not found in CMS config`)
  return client.findOne(id)
}

export async function createEntry<
  T extends CMSConfig,
  K extends keyof T['collections'] & string,
>(
  cms: AnyCMSClient<T>,
  collection: K,
  data: Omit<InferCollectionRecord<T['collections'][K]>, 'id' | 'createdAt' | 'updatedAt'>
): Promise<InferCollectionRecord<T['collections'][K]>> {
  const client = cms[collection]
  if (!client) throw new Error(`Collection "${collection}" not found in CMS config`)
  const result = await client.create(data)

  if ('state' in cms) {
    await asCached(cms).state.invalidateCollection(collection)
  }

  return result
}

export async function updateEntry<
  T extends CMSConfig,
  K extends keyof T['collections'] & string,
>(
  cms: AnyCMSClient<T>,
  collection: K,
  id: number,
  data: Partial<Omit<InferCollectionRecord<T['collections'][K]>, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<InferCollectionRecord<T['collections'][K]>> {
  const client = cms[collection]
  if (!client) throw new Error(`Collection "${collection}" not found in CMS config`)
  const result = await client.update(id, data)

  if ('state' in cms) {
    await asCached(cms).state.invalidate(`cms:${collection}:${id}`)
    await asCached(cms).state.invalidateCollection(collection)
  }

  return result
}

export async function deleteEntry<
  T extends CMSConfig,
  K extends keyof T['collections'] & string,
>(
  cms: AnyCMSClient<T>,
  collection: K,
  id: number
): Promise<void> {
  const client = cms[collection]
  if (!client) throw new Error(`Collection "${collection}" not found in CMS config`)
  await client.delete(id)

  if ('state' in cms) {
    await asCached(cms).state.invalidate(`cms:${collection}:${id}`)
    await asCached(cms).state.invalidateCollection(collection)
  }
}

export async function invalidateCollectionCache<
  T extends CMSConfig,
>(
  cms: CachedCMSClient<T>,
  collection: keyof T['collections'] & string
): Promise<void> {
  if ('state' in cms) {
    await cms.state.invalidateCollection(collection)
  }
}
