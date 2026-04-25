import type { SystemClient } from '../system/client.js';
import type { Tag, Category } from '../system/types.js';
export declare function getTags(system: SystemClient): Promise<Tag[]>;
export declare function getCategories(system: SystemClient): Promise<Category[]>;
export declare function getCategoryTree(system: SystemClient): Promise<(Category & {
    children: Category[];
})[]>;
//# sourceMappingURL=taxonomy.d.ts.map