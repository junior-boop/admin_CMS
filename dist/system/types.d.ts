export interface Menu {
    id: number;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}
export interface MenuItem {
    id: number;
    menuId: number;
    label: string;
    url: string;
    target: '_self' | '_blank' | null;
    className: string | null;
    order: number;
    parentId: number | null;
    createdAt: string;
    updatedAt: string;
}
export interface MenuWithItems extends Menu {
    items: MenuItem[];
}
export interface Tag {
    id: number;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}
export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parentId: number | null;
    createdAt: string;
    updatedAt: string;
}
export type SectionType = 'hero' | 'text' | 'gallery' | 'cta' | 'custom';
export interface Section {
    id: number;
    page: string;
    type: SectionType;
    title: string | null;
    content: string | null;
    order: number;
    settings: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface Widget {
    id: number;
    name: string;
    area: string;
    type: string;
    content: string | null;
    order: number;
    createdAt: string;
    updatedAt: string;
}
export type CommentStatus = 'pending' | 'approved' | 'rejected';
export interface Comment {
    id: number;
    collection: string;
    entryId: number;
    author: string;
    email: string;
    content: string;
    status: CommentStatus;
    createdAt: string;
    updatedAt: string;
}
export type FormFieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'date' | 'tel' | 'url';
export interface Form {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface FormField {
    id: number;
    formId: number;
    label: string;
    type: FormFieldType;
    required: number;
    placeholder: string | null;
    options: string | null;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}
export interface FormSubmission {
    id: number;
    formId: number;
    data: string;
    createdAt: string;
}
export interface ContentType {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}
export type ContentTypeFieldType = 'text' | 'richtext' | 'textarea' | 'number' | 'boolean' | 'date' | 'select' | 'email' | 'url';
export interface ContentTypeField {
    id: number;
    contentTypeId: number;
    name: string;
    label: string;
    type: ContentTypeFieldType;
    required: number;
    placeholder: string | null;
    helpText: string | null;
    options: string | null;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}
export interface Entry {
    id: number;
    contentTypeId: number;
    data: string;
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
}
export interface MediaEntry {
    id: number;
    key: string;
    filename: string;
    contentType: string;
    size: number;
    url: string;
    alt: string | null;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=types.d.ts.map