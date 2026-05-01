import type { CollectionDefinition, InferCollectionRecord } from '../config/types.js';
import type { StateManager } from './state.js';
export interface FindOptions {
    where?: Record<string, string | number | boolean | null>;
    limit?: number;
    offset?: number;
    orderBy?: {
        field: string;
        direction?: 'asc' | 'desc';
    };
}
export interface CachedCollectionClient<TRecord> {
    find(options?: FindOptions): Promise<TRecord[]>;
    findOne(id: number): Promise<TRecord | null>;
    create(data: Omit<TRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TRecord>;
    update(id: number, data: Partial<Omit<TRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TRecord>;
    delete(id: number): Promise<void>;
}
export declare function createCachedCollectionClient<C extends CollectionDefinition>(db: D1Database, cache: StateManager, tableName: string, _definition: C): CachedCollectionClient<InferCollectionRecord<C>>;
//# sourceMappingURL=cached-collections.d.ts.map