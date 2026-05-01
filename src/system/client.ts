import type {
  Menu, MenuItem, MenuWithItems,
  Tag, Category,
  Section, SectionType,
  Widget, Comment, CommentStatus,
  MediaEntry,
  Form, FormField, FormFieldType, FormSubmission,
  ContentType, ContentTypeField, ContentTypeFieldType, Entry,
} from './types.js'

function now() { return new Date().toISOString() }

type CacheClient = {
  get<T = unknown>(key: string): Promise<T | null>
  set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void>
  invalidate(key: string): Promise<void>
  invalidatePattern(prefix: string): Promise<void>
}

type StateManager = {
  getOrFetch<T>(key: string, fetcher: () => Promise<T>, options?: { ttlSeconds?: number; useCache?: boolean }): Promise<T>
  invalidate(key: string): Promise<void>
  invalidatePattern(prefix: string): Promise<void>
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

function menuClient(db: D1Database) {
  return {
    async list(): Promise<Menu[]> {
      const r = await db.prepare('SELECT * FROM cms_menus ORDER BY name').all<Record<string, unknown>>()
      return r.results as unknown as Menu[]
    },

    async get(slug: string): Promise<MenuWithItems | null> {
      const menu = await db.prepare('SELECT * FROM cms_menus WHERE slug = ?').bind(slug).first<Menu>()
      if (!menu) return null
      const items = await db
        .prepare('SELECT * FROM cms_menu_items WHERE menu_id = ? ORDER BY order_index')
        .bind(menu.id).all<MenuItem>()
      return { ...menu, items: items.results }
    },

    async create(data: { name: string; slug: string }): Promise<Menu> {
      const t = now()
      const r = await db
        .prepare('INSERT INTO cms_menus (name, slug, created_at, updated_at) VALUES (?, ?, ?, ?) RETURNING *')
        .bind(data.name, data.slug, t, t).first<Menu>()
      if (!r) throw new Error('Failed to create menu')
      return r
    },

    async addItem(menuId: number, item: Omit<MenuItem, 'id' | 'menuId' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
      const t = now()
      const r = await db
        .prepare(`INSERT INTO cms_menu_items (menu_id, label, url, target, class_name, order_index, parent_id, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`)
        .bind(menuId, item.label, item.url, item.target ?? '_self', item.className ?? null, item.order, item.parentId ?? null, t, t)
        .first<MenuItem>()
      if (!r) throw new Error('Failed to create menu item')
      return r
    },

    async deleteItem(itemId: number): Promise<void> {
      await db.prepare('DELETE FROM cms_menu_items WHERE id = ?').bind(itemId).run()
    },

    async delete(menuId: number): Promise<void> {
      await db.prepare('DELETE FROM cms_menus WHERE id = ?').bind(menuId).run()
    },
  }
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

function tagsClient(db: D1Database) {
  return {
    async list(): Promise<Tag[]> {
      const r = await db.prepare('SELECT * FROM cms_tags ORDER BY name').all<Tag>()
      return r.results
    },

    async create(data: { name: string; slug: string }): Promise<Tag> {
      const t = now()
      const r = await db
        .prepare('INSERT INTO cms_tags (name, slug, created_at, updated_at) VALUES (?, ?, ?, ?) RETURNING *')
        .bind(data.name, data.slug, t, t).first<Tag>()
      if (!r) throw new Error('Failed to create tag')
      return r
    },

    async delete(id: number): Promise<void> {
      await db.prepare('DELETE FROM cms_tags WHERE id = ?').bind(id).run()
    },
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

function categoriesClient(db: D1Database) {
  return {
    async list(): Promise<Category[]> {
      const r = await db.prepare('SELECT * FROM cms_categories ORDER BY name').all<Category>()
      return r.results
    },

    async create(data: { name: string; slug: string; description?: string; parentId?: number }): Promise<Category> {
      const t = now()
      const r = await db
        .prepare(`INSERT INTO cms_categories (name, slug, description, parent_id, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?) RETURNING *`)
        .bind(data.name, data.slug, data.description ?? null, data.parentId ?? null, t, t)
        .first<Category>()
      if (!r) throw new Error('Failed to create category')
      return r
    },

    async delete(id: number): Promise<void> {
      await db.prepare('DELETE FROM cms_categories WHERE id = ?').bind(id).run()
    },
  }
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function sectionsClient(db: D1Database) {
  return {
    async listByPage(page: string): Promise<Section[]> {
      const r = await db
        .prepare('SELECT * FROM cms_sections WHERE page = ? ORDER BY order_index')
        .bind(page).all<Section>()
      return r.results
    },

    async create(data: { page: string; type: SectionType; title?: string; content?: string; order?: number; settings?: object }): Promise<Section> {
      const t = now()
      const r = await db
        .prepare(`INSERT INTO cms_sections (page, type, title, content, order_index, settings, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`)
        .bind(data.page, data.type, data.title ?? null, data.content ?? null,
              data.order ?? 0, data.settings ? JSON.stringify(data.settings) : null, t, t)
        .first<Section>()
      if (!r) throw new Error('Failed to create section')
      return r
    },

    async update(id: number, data: Partial<Pick<Section, 'title' | 'content' | 'order' | 'settings'>>): Promise<Section> {
      const t = now()
      const r = await db
        .prepare('UPDATE cms_sections SET title=?, content=?, order_index=?, updated_at=? WHERE id=? RETURNING *')
        .bind(data.title ?? null, data.content ?? null, data.order ?? 0, t, id)
        .first<Section>()
      if (!r) throw new Error(`Section ${id} not found`)
      return r
    },

    async delete(id: number): Promise<void> {
      await db.prepare('DELETE FROM cms_sections WHERE id = ?').bind(id).run()
    },
  }
}

// ─── Widgets ──────────────────────────────────────────────────────────────────

function widgetsClient(db: D1Database) {
  return {
    async listByArea(area: string): Promise<Widget[]> {
      const r = await db
        .prepare('SELECT * FROM cms_widgets WHERE area = ? ORDER BY order_index')
        .bind(area).all<Widget>()
      return r.results
    },

    async create(data: { name: string; area: string; type: string; content?: object; order?: number }): Promise<Widget> {
      const t = now()
      const r = await db
        .prepare(`INSERT INTO cms_widgets (name, area, type, content, order_index, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`)
        .bind(data.name, data.area, data.type, data.content ? JSON.stringify(data.content) : null, data.order ?? 0, t, t)
        .first<Widget>()
      if (!r) throw new Error('Failed to create widget')
      return r
    },

    async delete(id: number): Promise<void> {
      await db.prepare('DELETE FROM cms_widgets WHERE id = ?').bind(id).run()
    },
  }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

function commentsClient(db: D1Database) {
  return {
    async list(options: { collection?: string; status?: CommentStatus } = {}): Promise<Comment[]> {
      let sql = 'SELECT * FROM cms_comments WHERE 1=1'
      const binds: unknown[] = []
      if (options.collection) { sql += ' AND collection = ?'; binds.push(options.collection) }
      if (options.status) { sql += ' AND status = ?'; binds.push(options.status) }
      sql += ' ORDER BY created_at DESC'
      const r = await db.prepare(sql).bind(...binds).all<Comment>()
      return r.results
    },

    async create(data: Omit<Comment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
      const t = now()
      const r = await db
        .prepare(`INSERT INTO cms_comments (collection, entry_id, author, email, content, status, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, 'pending', ?, ?) RETURNING *`)
        .bind(data.collection, data.entryId, data.author, data.email, data.content, t, t)
        .first<Comment>()
      if (!r) throw new Error('Failed to create comment')
      return r
    },

    async updateStatus(id: number, status: CommentStatus): Promise<Comment> {
      const r = await db
        .prepare('UPDATE cms_comments SET status = ?, updated_at = ? WHERE id = ? RETURNING *')
        .bind(status, now(), id).first<Comment>()
      if (!r) throw new Error(`Comment ${id} not found`)
      return r
    },

    async delete(id: number): Promise<void> {
      await db.prepare('DELETE FROM cms_comments WHERE id = ?').bind(id).run()
    },
  }
}

// ─── Forms ────────────────────────────────────────────────────────────────────

function formsClient(db: D1Database) {
  return {
    async list(): Promise<Form[]> {
      const r = await db.prepare('SELECT * FROM cms_forms ORDER BY name').all<Form>()
      return r.results
    },

    async get(id: number): Promise<Form | null> {
      return db.prepare('SELECT * FROM cms_forms WHERE id = ?').bind(id).first<Form>()
    },

    async create(data: { name: string; slug: string; description?: string }): Promise<Form> {
      const t = now()
      const r = await db
        .prepare('INSERT INTO cms_forms (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING *')
        .bind(data.name, data.slug, data.description ?? null, t, t).first<Form>()
      if (!r) throw new Error('Failed to create form')
      return r
    },

    async delete(id: number): Promise<void> {
      await db.prepare('DELETE FROM cms_forms WHERE id = ?').bind(id).run()
    },

    async listFields(formId: number): Promise<FormField[]> {
      const r = await db
        .prepare('SELECT * FROM cms_form_fields WHERE form_id = ? ORDER BY order_index')
        .bind(formId).all<FormField>()
      return r.results
    },

    async addField(formId: number, data: {
      label: string; type: FormFieldType; required?: boolean;
      placeholder?: string; options?: string[]; order?: number
    }): Promise<FormField> {
      const t = now()
      const r = await db
        .prepare(`INSERT INTO cms_form_fields (form_id, label, type, required, placeholder, options, order_index, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`)
        .bind(formId, data.label, data.type, data.required ? 1 : 0,
              data.placeholder ?? null,
              data.options ? JSON.stringify(data.options) : null,
              data.order ?? 0, t, t)
        .first<FormField>()
      if (!r) throw new Error('Failed to create field')
      return r
    },

    async deleteField(fieldId: number): Promise<void> {
      await db.prepare('DELETE FROM cms_form_fields WHERE id = ?').bind(fieldId).run()
    },

    async listSubmissions(formId: number): Promise<FormSubmission[]> {
      const r = await db
        .prepare('SELECT * FROM cms_form_submissions WHERE form_id = ? ORDER BY created_at DESC')
        .bind(formId).all<FormSubmission>()
      return r.results
    },
  }
}

// ─── Dynamic Content Types ────────────────────────────────────────────────────

function contentTypesClient(db: D1Database) {
  return {
    async list(): Promise<ContentType[]> {
      const r = await db.prepare('SELECT * FROM cms_content_types ORDER BY name').all<ContentType>()
      return r.results
    },

    async get(id: number): Promise<ContentType | null> {
      return db.prepare('SELECT * FROM cms_content_types WHERE id = ?').bind(id).first<ContentType>()
    },

    async getBySlug(slug: string): Promise<ContentType | null> {
      return db.prepare('SELECT * FROM cms_content_types WHERE slug = ?').bind(slug).first<ContentType>()
    },

    async create(data: { name: string; slug: string; description?: string }): Promise<ContentType> {
      const t = now()
      const r = await db
        .prepare('INSERT INTO cms_content_types (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING *')
        .bind(data.name, data.slug, data.description ?? null, t, t).first<ContentType>()
      if (!r) throw new Error('Failed to create content type')
      return r
    },

    async delete(id: number): Promise<void> {
      await db.prepare('DELETE FROM cms_content_types WHERE id = ?').bind(id).run()
    },

    async listFields(contentTypeId: number): Promise<ContentTypeField[]> {
      const r = await db
        .prepare('SELECT * FROM cms_content_type_fields WHERE content_type_id = ? ORDER BY order_index')
        .bind(contentTypeId).all<ContentTypeField>()
      return r.results
    },

    async addField(contentTypeId: number, data: {
      name: string; label: string; type: ContentTypeFieldType;
      required?: boolean; placeholder?: string; helpText?: string;
      options?: string[]; order?: number
    }): Promise<ContentTypeField> {
      const t = now()
      const r = await db
        .prepare(`INSERT INTO cms_content_type_fields
                  (content_type_id, name, label, type, required, placeholder, help_text, options, order_index, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`)
        .bind(contentTypeId, data.name, data.label, data.type, data.required ? 1 : 0,
              data.placeholder ?? null, data.helpText ?? null,
              data.options ? JSON.stringify(data.options) : null,
              data.order ?? 0, t, t)
        .first<ContentTypeField>()
      if (!r) throw new Error('Failed to create field')
      return r
    },

    async deleteField(fieldId: number): Promise<void> {
      await db.prepare('DELETE FROM cms_content_type_fields WHERE id = ?').bind(fieldId).run()
    },
  }
}

// ─── Entries (dynamic content type entries stored as JSON) ────────────────────

function entriesClient(db: D1Database) {
  return {
    async list(contentTypeId: number, options: { status?: string; limit?: number } = {}): Promise<Entry[]> {
      let sql = 'SELECT * FROM cms_entries WHERE content_type_id = ?'
      const binds: unknown[] = [contentTypeId]
      if (options.status) { sql += ' AND status = ?'; binds.push(options.status) }
      sql += ' ORDER BY created_at DESC'
      if (options.limit) { sql += ' LIMIT ?'; binds.push(options.limit) }
      const r = await db.prepare(sql).bind(...binds).all<Entry>()
      return r.results
    },

    async get(id: number): Promise<Entry | null> {
      return db.prepare('SELECT * FROM cms_entries WHERE id = ?').bind(id).first<Entry>()
    },

    async create(contentTypeId: number, data: Record<string, unknown>, status: 'draft' | 'published' = 'draft'): Promise<Entry> {
      const t = now()
      const r = await db
        .prepare('INSERT INTO cms_entries (content_type_id, data, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING *')
        .bind(contentTypeId, JSON.stringify(data), status, t, t).first<Entry>()
      if (!r) throw new Error('Failed to create entry')
      return r
    },

    async update(id: number, data: Record<string, unknown>, status?: 'draft' | 'published'): Promise<Entry> {
      const existing = await db.prepare('SELECT * FROM cms_entries WHERE id = ?').bind(id).first<Entry>()
      if (!existing) throw new Error(`Entry ${id} not found`)
      const merged = { ...JSON.parse(existing.data), ...data }
      const t = now()
      const r = await db
        .prepare('UPDATE cms_entries SET data = ?, status = ?, updated_at = ? WHERE id = ? RETURNING *')
        .bind(JSON.stringify(merged), status ?? existing.status, t, id).first<Entry>()
      if (!r) throw new Error(`Entry ${id} not found`)
      return r
    },

    async delete(id: number): Promise<void> {
      await db.prepare('DELETE FROM cms_entries WHERE id = ?').bind(id).run()
    },
  }
}

// ─── Media ────────────────────────────────────────────────────────────────────

function mediaDbClient(db: D1Database) {
  return {
    async list(limit = 50, offset = 0): Promise<MediaEntry[]> {
      const r = await db
        .prepare('SELECT * FROM cms_media ORDER BY created_at DESC LIMIT ? OFFSET ?')
        .bind(limit, offset).all<MediaEntry>()
      return r.results
    },

    async create(data: Omit<MediaEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaEntry> {
      const t = now()
      const r = await db
        .prepare(`INSERT INTO cms_media (key, filename, content_type, size, url, alt, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`)
        .bind(data.key, data.filename, data.contentType, data.size, data.url, data.alt ?? null, t, t)
        .first<MediaEntry>()
      if (!r) throw new Error('Failed to save media entry')
      return r
    },

    async delete(id: number): Promise<void> {
      await db.prepare('DELETE FROM cms_media WHERE id = ?').bind(id).run()
    },
  }
}

// ─── System client factory ────────────────────────────────────────────────────

export interface SystemClient {
  menu: ReturnType<typeof menuClient>
  tags: ReturnType<typeof tagsClient>
  categories: ReturnType<typeof categoriesClient>
  sections: ReturnType<typeof sectionsClient>
  widgets: ReturnType<typeof widgetsClient>
  comments: ReturnType<typeof commentsClient>
  mediaDb: ReturnType<typeof mediaDbClient>
  forms: ReturnType<typeof formsClient>
  contentTypes: ReturnType<typeof contentTypesClient>
  entries: ReturnType<typeof entriesClient>
}

export function createSystemClient(db: D1Database): SystemClient {
  return {
    menu: menuClient(db),
    tags: tagsClient(db),
    categories: categoriesClient(db),
    sections: sectionsClient(db),
    widgets: widgetsClient(db),
    comments: commentsClient(db),
    mediaDb: mediaDbClient(db),
    forms: formsClient(db),
    contentTypes: contentTypesClient(db),
    entries: entriesClient(db),
  }
}

// ─── Cached clients ───────────────────────────────────────────────────────────────

function cachedMenuClient(db: D1Database, state: StateManager) {
  const base = menuClient(db)
  return {
    async list(): Promise<Menu[]> {
      return state.getOrFetch('cms:menu:list', () => base.list(), { ttlSeconds: 120 })
    },
    async get(slug: string): Promise<MenuWithItems | null> {
      return state.getOrFetch(`cms:menu:${slug}`, () => base.get(slug), { ttlSeconds: 120 })
    },
    async create(data: { name: string; slug: string }): Promise<Menu> {
      const result = await base.create(data)
      await state.invalidatePattern('cms:menu:')
      return result
    },
    async addItem(menuId: number, item: Omit<MenuItem, 'id' | 'menuId' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
      const result = await base.addItem(menuId, item)
      const menu = await db.prepare('SELECT slug FROM cms_menus WHERE id = ?').bind(menuId).first<{ slug: string }>()
      if (menu) await state.invalidate(`cms:menu:${menu.slug}`)
      return result
    },
    async deleteItem(itemId: number): Promise<void> {
      const item = await db.prepare('SELECT m.slug FROM cms_menu_items mi JOIN cms_menus m ON mi.menu_id = m.id WHERE mi.id = ?').bind(itemId).first<{ slug: string }>()
      await base.deleteItem(itemId)
      if (item) await state.invalidate(`cms:menu:${item.slug}`)
    },
    async delete(menuId: number): Promise<void> {
      await base.delete(menuId)
      await state.invalidatePattern('cms:menu:')
    },
  }
}

function cachedTagsClient(db: D1Database, state: StateManager) {
  const base = tagsClient(db)
  return {
    async list(): Promise<Tag[]> {
      return state.getOrFetch('cms:tags:list', () => base.list(), { ttlSeconds: 180 })
    },
    async create(data: { name: string; slug: string }): Promise<Tag> {
      const result = await base.create(data)
      await state.invalidate('cms:tags:list')
      return result
    },
    async delete(id: number): Promise<void> {
      await base.delete(id)
      await state.invalidate('cms:tags:list')
    },
  }
}

function cachedCategoriesClient(db: D1Database, state: StateManager) {
  const base = categoriesClient(db)
  return {
    async list(): Promise<Category[]> {
      return state.getOrFetch('cms:categories:list', () => base.list(), { ttlSeconds: 180 })
    },
    async create(data: { name: string; slug: string; description?: string; parentId?: number }): Promise<Category> {
      const result = await base.create(data)
      await state.invalidate('cms:categories:list')
      return result
    },
    async delete(id: number): Promise<void> {
      await base.delete(id)
      await state.invalidate('cms:categories:list')
    },
  }
}

function cachedSectionsClient(db: D1Database, state: StateManager) {
  const base = sectionsClient(db)
  return {
    async listByPage(page: string): Promise<Section[]> {
      return state.getOrFetch(`cms:sections:${page}`, () => base.listByPage(page), { ttlSeconds: 120 })
    },
    async create(data: { page: string; type: SectionType; title?: string; content?: string; order?: number; settings?: object }): Promise<Section> {
      const result = await base.create(data)
      await state.invalidate(`cms:sections:${data.page}`)
      return result
    },
    async update(id: number, data: Partial<Pick<Section, 'title' | 'content' | 'order' | 'settings'>>): Promise<Section> {
      const section = await db.prepare('SELECT page FROM cms_sections WHERE id = ?').bind(id).first<{ page: string }>()
      const result = await base.update(id, data)
      if (section) await state.invalidate(`cms:sections:${section.page}`)
      return result
    },
    async delete(id: number): Promise<void> {
      const section = await db.prepare('SELECT page FROM cms_sections WHERE id = ?').bind(id).first<{ page: string }>()
      await base.delete(id)
      if (section) await state.invalidate(`cms:sections:${section.page}`)
    },
  }
}

function cachedFormsClient(db: D1Database, state: StateManager) {
  const base = formsClient(db)
  return {
    async list(): Promise<Form[]> {
      return state.getOrFetch('cms:forms:list', () => base.list(), { ttlSeconds: 180 })
    },
    async get(id: number): Promise<Form | null> {
      return state.getOrFetch(`cms:forms:${id}`, () => base.get(id))
    },
    async create(data: { name: string; slug: string; description?: string }): Promise<Form> {
      const result = await base.create(data)
      await state.invalidate('cms:forms:list')
      return result
    },
    async delete(id: number): Promise<void> {
      await base.delete(id)
      await state.invalidate('cms:forms:list')
      await state.invalidatePattern('cms:forms:')
    },
    async listFields(formId: number): Promise<FormField[]> {
      return state.getOrFetch(`cms:forms:${formId}:fields`, () => base.listFields(formId))
    },
    async addField(formId: number, data: { label: string; type: FormFieldType; required?: boolean; placeholder?: string; options?: string[]; order?: number }): Promise<FormField> {
      const result = await base.addField(formId, data)
      await state.invalidate(`cms:forms:${formId}:fields`)
      return result
    },
    async deleteField(fieldId: number): Promise<void> {
      const field = await db.prepare('SELECT form_id FROM cms_form_fields WHERE id = ?').bind(fieldId).first<{ form_id: number }>()
      await base.deleteField(fieldId)
      if (field) await state.invalidate(`cms:forms:${field.form_id}:fields`)
    },
    async listSubmissions(formId: number): Promise<FormSubmission[]> {
      return state.getOrFetch(`cms:forms:${formId}:submissions`, () => base.listSubmissions(formId), { ttlSeconds: 30 })
    },
  }
}

function cachedContentTypesClient(db: D1Database, state: StateManager) {
  const base = contentTypesClient(db)
  return {
    async list(): Promise<ContentType[]> {
      return state.getOrFetch('cms:contentTypes:list', () => base.list(), { ttlSeconds: 300 })
    },
    async get(id: number): Promise<ContentType | null> {
      return state.getOrFetch(`cms:contentTypes:${id}`, () => base.get(id))
    },
    async getBySlug(slug: string): Promise<ContentType | null> {
      return state.getOrFetch(`cms:contentTypes:slug:${slug}`, () => base.getBySlug(slug), { ttlSeconds: 300 })
    },
    async create(data: { name: string; slug: string; description?: string }): Promise<ContentType> {
      const result = await base.create(data)
      await state.invalidate('cms:contentTypes:list')
      return result
    },
    async delete(id: number): Promise<void> {
      await base.delete(id)
      await state.invalidate('cms:contentTypes:list')
      await state.invalidatePattern('cms:contentTypes:')
    },
    async listFields(contentTypeId: number): Promise<ContentTypeField[]> {
      return state.getOrFetch(`cms:contentTypes:${contentTypeId}:fields`, () => base.listFields(contentTypeId))
    },
    async addField(contentTypeId: number, data: { name: string; label: string; type: ContentTypeFieldType; required?: boolean; placeholder?: string; helpText?: string; options?: string[]; order?: number }): Promise<ContentTypeField> {
      const result = await base.addField(contentTypeId, data)
      await state.invalidate(`cms:contentTypes:${contentTypeId}:fields`)
      return result
    },
    async deleteField(fieldId: number): Promise<void> {
      const field = await db.prepare('SELECT content_type_id FROM cms_content_type_fields WHERE id = ?').bind(fieldId).first<{ content_type_id: number }>()
      await base.deleteField(fieldId)
      if (field) await state.invalidate(`cms:contentTypes:${field.content_type_id}:fields`)
    },
  }
}

function cachedEntriesClient(db: D1Database, state: StateManager) {
  const base = entriesClient(db)
  return {
    async list(contentTypeId: number, options: { status?: string; limit?: number } = {}): Promise<Entry[]> {
      const key = `cms:entries:${contentTypeId}:${options.status || 'all'}`
      return state.getOrFetch(key, () => base.list(contentTypeId, options), { ttlSeconds: 60 })
    },
    async get(id: number): Promise<Entry | null> {
      return state.getOrFetch(`cms:entries:${id}`, () => base.get(id), { ttlSeconds: 30 })
    },
    async create(contentTypeId: number, data: Record<string, unknown>, status: 'draft' | 'published' = 'draft'): Promise<Entry> {
      const result = await base.create(contentTypeId, data, status)
      await state.invalidate(`cms:entries:${contentTypeId}:all`)
      return result
    },
    async update(id: number, data: Record<string, unknown>, status?: 'draft' | 'published'): Promise<Entry> {
      const entry = await base.get(id)
      const result = await base.update(id, data, status)
      if (entry) {
        await state.invalidate(`cms:entries:${id}`)
        await state.invalidate(`cms:entries:${entry.content_type_id}:all`)
      }
      return result
    },
    async delete(id: number): Promise<void> {
      const entry = await base.get(id)
      await base.delete(id)
      if (entry) {
        await state.invalidate(`cms:entries:${id}`)
        await state.invalidate(`cms:entries:${entry.content_type_id}:all`)
      }
    },
  }
}

function cachedMediaDbClient(db: D1Database, state: StateManager) {
  const base = mediaDbClient(db)
  return {
    async list(limit = 50, offset = 0): Promise<MediaEntry[]> {
      return state.getOrFetch(`cms:media:list:${limit}:${offset}`, () => base.list(limit, offset), { ttlSeconds: 60 })
    },
    async create(data: Omit<MediaEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaEntry> {
      const result = await base.create(data)
      await state.invalidatePattern('cms:media:')
      return result
    },
    async delete(id: number): Promise<void> {
      await base.delete(id)
      await state.invalidatePattern('cms:media:')
    },
  }
}

function cachedCommentsClient(db: D1Database, state: StateManager) {
  const base = commentsClient(db)
  return {
    async list(options: { collection?: string; status?: CommentStatus } = {}): Promise<Comment[]> {
      const key = `cms:comments:${options.collection || 'all'}:${options.status || 'all'}`
      return state.getOrFetch(key, () => base.list(options), { ttlSeconds: 30 })
    },
    async create(data: Omit<Comment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
      const result = await base.create(data)
      await state.invalidatePattern('cms:comments:')
      return result
    },
    async updateStatus(id: number, status: CommentStatus): Promise<Comment> {
      const result = await base.updateStatus(id, status)
      await state.invalidatePattern('cms:comments:')
      return result
    },
    async delete(id: number): Promise<void> {
      await base.delete(id)
      await state.invalidatePattern('cms:comments:')
    },
  }
}

function cachedWidgetsClient(db: D1Database, state: StateManager) {
  const base = widgetsClient(db)
  return {
    async listByArea(area: string): Promise<Widget[]> {
      return state.getOrFetch(`cms:widgets:${area}`, () => base.listByArea(area), { ttlSeconds: 120 })
    },
    async create(data: { name: string; area: string; type: string; content?: object; order?: number }): Promise<Widget> {
      const result = await base.create(data)
      await state.invalidate(`cms:widgets:${data.area}`)
      return result
    },
    async delete(id: number): Promise<void> {
      const widget = await db.prepare('SELECT area FROM cms_widgets WHERE id = ?').bind(id).first<{ area: string }>()
      await base.delete(id)
      if (widget) await state.invalidate(`cms:widgets:${widget.area}`)
    },
  }
}

export interface CachedSystemClient extends SystemClient {
  state: StateManager
}

export function createCachedSystemClient(db: D1Database, kv: KVNamespace): CachedSystemClient {
  const memoryCache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()

  const state: StateManager = {
    async getOrFetch<T>(key: string, fetcher: () => Promise<T>, options = {}): Promise<T> {
      const { ttlSeconds = 60, useCache = true } = options
      if (useCache) {
        const memEntry = memoryCache.get(key)
        if (memEntry && Date.now() - memEntry.timestamp < memEntry.ttl * 1000) {
          return memEntry.data as T
        }
        try {
          const kvVal = await kv.get(key, 'text')
          if (kvVal) {
            const data = JSON.parse(kvVal) as T
            memoryCache.set(key, { data, timestamp: Date.now(), ttl: ttlSeconds })
            return data
          }
        } catch {}
      }
      const data = await fetcher()
      if (useCache) {
        memoryCache.set(key, { data, timestamp: Date.now(), ttl: ttlSeconds })
        await kv.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds })
      }
      return data
    },
    async invalidate(key: string): Promise<void> {
      memoryCache.delete(key)
      await kv.delete(key)
    },
    async invalidatePattern(prefix: string): Promise<void> {
      for (const k of memoryCache.keys()) {
        if (k.startsWith(prefix)) memoryCache.delete(k)
      }
      const list = await kv.list({ prefix })
      await Promise.all(list.keys.map(k => kv.delete(k.name)))
    },
  }

  return {
    state,
    menu: cachedMenuClient(db, state),
    tags: cachedTagsClient(db, state),
    categories: cachedCategoriesClient(db, state),
    sections: cachedSectionsClient(db, state),
    widgets: cachedWidgetsClient(db, state),
    comments: cachedCommentsClient(db, state),
    mediaDb: cachedMediaDbClient(db, state),
    forms: cachedFormsClient(db, state),
    contentTypes: cachedContentTypesClient(db, state),
    entries: cachedEntriesClient(db, state),
  }
}
