import type { SystemClient } from '../system/client.js';
import type { MenuWithItems, MenuItem } from '../system/types.js';
export declare function getMenu(system: SystemClient, slug: string): Promise<MenuWithItems | null>;
export declare function getMenus(system: SystemClient): Promise<import("../system/types.js").Menu[]>;
export declare function getMenuItems(system: SystemClient, slug: string): Promise<MenuItem[]>;
//# sourceMappingURL=menu.d.ts.map