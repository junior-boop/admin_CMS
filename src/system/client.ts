import type {
  Menu, MenuItem, MenuWithItems,
  Tag, Category,
  Section, SectionType,
  Widget, Comment, CommentStatus,
  MediaEntry,
  Form, FormField, FormFieldType, FormSubmission,
} from './types.js'

function now() { return new Date().toISOString() }

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
  }
}
