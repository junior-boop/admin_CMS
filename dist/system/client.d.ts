import type { Menu, MenuItem, MenuWithItems, Tag, Category, Section, SectionType, Widget, Comment, CommentStatus, MediaEntry } from './types.js';
declare function menuClient(db: D1Database): {
    list(): Promise<Menu[]>;
    get(slug: string): Promise<MenuWithItems | null>;
    create(data: {
        name: string;
        slug: string;
    }): Promise<Menu>;
    addItem(menuId: number, item: Omit<MenuItem, "id" | "menuId" | "createdAt" | "updatedAt">): Promise<MenuItem>;
    deleteItem(itemId: number): Promise<void>;
    delete(menuId: number): Promise<void>;
};
declare function tagsClient(db: D1Database): {
    list(): Promise<Tag[]>;
    create(data: {
        name: string;
        slug: string;
    }): Promise<Tag>;
    delete(id: number): Promise<void>;
};
declare function categoriesClient(db: D1Database): {
    list(): Promise<Category[]>;
    create(data: {
        name: string;
        slug: string;
        description?: string;
        parentId?: number;
    }): Promise<Category>;
    delete(id: number): Promise<void>;
};
declare function sectionsClient(db: D1Database): {
    listByPage(page: string): Promise<Section[]>;
    create(data: {
        page: string;
        type: SectionType;
        title?: string;
        content?: string;
        order?: number;
        settings?: object;
    }): Promise<Section>;
    update(id: number, data: Partial<Pick<Section, "title" | "content" | "order" | "settings">>): Promise<Section>;
    delete(id: number): Promise<void>;
};
declare function widgetsClient(db: D1Database): {
    listByArea(area: string): Promise<Widget[]>;
    create(data: {
        name: string;
        area: string;
        type: string;
        content?: object;
        order?: number;
    }): Promise<Widget>;
    delete(id: number): Promise<void>;
};
declare function commentsClient(db: D1Database): {
    list(options?: {
        collection?: string;
        status?: CommentStatus;
    }): Promise<Comment[]>;
    create(data: Omit<Comment, "id" | "status" | "createdAt" | "updatedAt">): Promise<Comment>;
    updateStatus(id: number, status: CommentStatus): Promise<Comment>;
    delete(id: number): Promise<void>;
};
declare function mediaDbClient(db: D1Database): {
    list(limit?: number, offset?: number): Promise<MediaEntry[]>;
    create(data: Omit<MediaEntry, "id" | "createdAt" | "updatedAt">): Promise<MediaEntry>;
    delete(id: number): Promise<void>;
};
export interface SystemClient {
    menu: ReturnType<typeof menuClient>;
    tags: ReturnType<typeof tagsClient>;
    categories: ReturnType<typeof categoriesClient>;
    sections: ReturnType<typeof sectionsClient>;
    widgets: ReturnType<typeof widgetsClient>;
    comments: ReturnType<typeof commentsClient>;
    mediaDb: ReturnType<typeof mediaDbClient>;
}
export declare function createSystemClient(db: D1Database): SystemClient;
export {};
//# sourceMappingURL=client.d.ts.map