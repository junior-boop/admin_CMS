import type { CMSConfig, InferCollectionRecord } from '../config/types.js';
import type { CMSClient, CachedCMSClient } from '../runtime/client.js';
import type { FindOptions } from '../runtime/collections.js';
type AnyCMSClient<T extends CMSConfig> = CMSClient<T> | CachedCMSClient<T>;
export declare function getCollection<T extends CMSConfig, K extends keyof T['collections'] & string>(cms: AnyCMSClient<T>, collection: K, options?: FindOptions): Promise<InferCollectionRecord<T['collections'][K]>[]>;
export declare function getEntry<T extends CMSConfig, K extends keyof T['collections'] & string>(cms: AnyCMSClient<T>, collection: K, id: number): Promise<InferCollectionRecord<T['collections'][K]> | null>;
export declare function createEntry<T extends CMSConfig, K extends keyof T['collections'] & string>(cms: AnyCMSClient<T>, collection: K, data: Omit<InferCollectionRecord<T['collections'][K]>, 'id' | 'createdAt' | 'updatedAt'>): Promise<InferCollectionRecord<T['collections'][K]>>;
export declare function updateEntry<T extends CMSConfig, K extends keyof T['collections'] & string>(cms: AnyCMSClient<T>, collection: K, id: number, data: Partial<Omit<InferCollectionRecord<T['collections'][K]>, 'id' | 'createdAt' | 'updatedAt'>>): Promise<InferCollectionRecord<T['collections'][K]>>;
export declare function deleteEntry<T extends CMSConfig, K extends keyof T['collections'] & string>(cms: AnyCMSClient<T>, collection: K, id: number): Promise<void>;
export declare function invalidateCollectionCache<T extends CMSConfig>(cms: CachedCMSClient<T>, collection: keyof T['collections'] & string): Promise<void>;
export {};
//# sourceMappingURL=collections.d.ts.map