import type { CMSConfig, InferCollectionRecord } from '../config/types.js'
import type { CMSClient } from '../runtime/client.js'
import type { FindOptions } from '../runtime/collections.js'

export async function getCollection<
  T extends CMSConfig,
  K extends keyof T['collections'] & string,
>(
  cms: CMSClient<T>,
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
  cms: CMSClient<T>,
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
  cms: CMSClient<T>,
  collection: K,
  data: Omit<InferCollectionRecord<T['collections'][K]>, 'id' | 'createdAt' | 'updatedAt'>
): Promise<InferCollectionRecord<T['collections'][K]>> {
  const client = cms[collection]
  if (!client) throw new Error(`Collection "${collection}" not found in CMS config`)
  return client.create(data)
}

export async function updateEntry<
  T extends CMSConfig,
  K extends keyof T['collections'] & string,
>(
  cms: CMSClient<T>,
  collection: K,
  id: number,
  data: Partial<Omit<InferCollectionRecord<T['collections'][K]>, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<InferCollectionRecord<T['collections'][K]>> {
  const client = cms[collection]
  if (!client) throw new Error(`Collection "${collection}" not found in CMS config`)
  return client.update(id, data)
}

export async function deleteEntry<
  T extends CMSConfig,
  K extends keyof T['collections'] & string,
>(
  cms: CMSClient<T>,
  collection: K,
  id: number
): Promise<void> {
  const client = cms[collection]
  if (!client) throw new Error(`Collection "${collection}" not found in CMS config`)
  return client.delete(id)
}
