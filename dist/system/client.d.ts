import type { Menu, MenuItem, MenuWithItems, Tag, Category, Section, SectionType, Widget, Comment, CommentStatus, MediaEntry, Form, FormField, FormFieldType, FormSubmission, ContentType, ContentTypeField, ContentTypeFieldType, Entry } from './types.js';
type StateManager = {
    getOrFetch<T>(key: string, fetcher: () => Promise<T>, options?: {
        ttlSeconds?: number;
        useCache?: boolean;
    }): Promise<T>;
    invalidate(key: string): Promise<void>;
    invalidatePattern(prefix: string): Promise<void>;
};
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
declare function formsClient(db: D1Database): {
    list(): Promise<Form[]>;
    get(id: number): Promise<Form | null>;
    create(data: {
        name: string;
        slug: string;
        description?: string;
    }): Promise<Form>;
    delete(id: number): Promise<void>;
    listFields(formId: number): Promise<FormField[]>;
    addField(formId: number, data: {
        label: string;
        type: FormFieldType;
        required?: boolean;
        placeholder?: string;
        options?: string[];
        order?: number;
    }): Promise<FormField>;
    deleteField(fieldId: number): Promise<void>;
    listSubmissions(formId: number): Promise<FormSubmission[]>;
};
declare function contentTypesClient(db: D1Database): {
    list(): Promise<ContentType[]>;
    get(id: number): Promise<ContentType | null>;
    getBySlug(slug: string): Promise<ContentType | null>;
    create(data: {
        name: string;
        slug: string;
        description?: string;
    }): Promise<ContentType>;
    delete(id: number): Promise<void>;
    listFields(contentTypeId: number): Promise<ContentTypeField[]>;
    addField(contentTypeId: number, data: {
        name: string;
        label: string;
        type: ContentTypeFieldType;
        required?: boolean;
        placeholder?: string;
        helpText?: string;
        options?: string[];
        order?: number;
    }): Promise<ContentTypeField>;
    deleteField(fieldId: number): Promise<void>;
};
declare function entriesClient(db: D1Database): {
    list(contentTypeId: number, options?: {
        status?: string;
        limit?: number;
    }): Promise<Entry[]>;
    get(id: number): Promise<Entry | null>;
    create(contentTypeId: number, data: Record<string, unknown>, status?: "draft" | "published"): Promise<Entry>;
    update(id: number, data: Record<string, unknown>, status?: "draft" | "published"): Promise<Entry>;
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
    forms: ReturnType<typeof formsClient>;
    contentTypes: ReturnType<typeof contentTypesClient>;
    entries: ReturnType<typeof entriesClient>;
}
export declare function createSystemClient(db: D1Database): SystemClient;
export interface CachedSystemClient extends SystemClient {
    state: StateManager;
}
export declare function createCachedSystemClient(db: D1Database, kv?: KVNamespace): CachedSystemClient;
export {};
//# sourceMappingURL=client.d.ts.map