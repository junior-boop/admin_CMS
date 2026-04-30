// ─── Menu ─────────────────────────────────────────────────────────────────────

export interface Menu {
  id: number
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface MenuItem {
  id: number
  menuId: number
  label: string
  url: string
  target: '_self' | '_blank' | null
  className: string | null
  order: number
  parentId: number | null
  createdAt: string
  updatedAt: string
}

export interface MenuWithItems extends Menu {
  items: MenuItem[]
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export interface Tag {
  id: number
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  parentId: number | null
  createdAt: string
  updatedAt: string
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export type SectionType = 'hero' | 'text' | 'gallery' | 'cta' | 'custom'

export interface Section {
  id: number
  page: string
  type: SectionType
  title: string | null
  content: string | null
  order: number
  settings: string | null  // JSON blob
  createdAt: string
  updatedAt: string
}

// ─── Widgets ──────────────────────────────────────────────────────────────────

export interface Widget {
  id: number
  name: string
  area: string
  type: string
  content: string | null  // JSON blob
  order: number
  createdAt: string
  updatedAt: string
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export type CommentStatus = 'pending' | 'approved' | 'rejected'

export interface Comment {
  id: number
  collection: string
  entryId: number
  author: string
  email: string
  content: string
  status: CommentStatus
  createdAt: string
  updatedAt: string
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export type FormFieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'date' | 'tel' | 'url'

export interface Form {
  id: number
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface FormField {
  id: number
  formId: number
  label: string
  type: FormFieldType
  required: number  // 0 | 1 (SQLite boolean)
  placeholder: string | null
  options: string | null  // JSON array for select/radio/checkbox
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export interface FormSubmission {
  id: number
  formId: number
  data: string  // JSON
  createdAt: string
}

// ─── Dynamic Content Types ────────────────────────────────────────────────────

export interface ContentType {
  id: number
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type ContentTypeFieldType = 'text' | 'richtext' | 'textarea' | 'number' | 'boolean' | 'date' | 'select' | 'email' | 'url'

export interface ContentTypeField {
  id: number
  contentTypeId: number
  name: string            // field key used in JSON data
  label: string           // display label
  type: ContentTypeFieldType
  required: number        // 0 | 1 (SQLite boolean)
  placeholder: string | null
  helpText: string | null // shown below the input
  options: string | null  // JSON array for select
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export interface Entry {
  id: number
  contentTypeId: number
  data: string       // JSON blob
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

// ─── Media (built-in, stored in R2 + metadata in D1) ─────────────────────────

export interface MediaEntry {
  id: number
  key: string        // R2 object key
  filename: string
  contentType: string
  size: number
  url: string
  alt: string | null
  createdAt: string
  updatedAt: string
}
