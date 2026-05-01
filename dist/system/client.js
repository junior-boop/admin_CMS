function now() { return new Date().toISOString(); }
// ─── Menu ─────────────────────────────────────────────────────────────────────
function menuClient(db) {
    return {
        async list() {
            const r = await db.prepare('SELECT * FROM cms_menus ORDER BY name').all();
            return r.results;
        },
        async get(slug) {
            const menu = await db.prepare('SELECT * FROM cms_menus WHERE slug = ?').bind(slug).first();
            if (!menu)
                return null;
            const items = await db
                .prepare('SELECT * FROM cms_menu_items WHERE menu_id = ? ORDER BY order_index')
                .bind(menu.id).all();
            return { ...menu, items: items.results };
        },
        async create(data) {
            const t = now();
            const r = await db
                .prepare('INSERT INTO cms_menus (name, slug, created_at, updated_at) VALUES (?, ?, ?, ?) RETURNING *')
                .bind(data.name, data.slug, t, t).first();
            if (!r)
                throw new Error('Failed to create menu');
            return r;
        },
        async addItem(menuId, item) {
            const t = now();
            const r = await db
                .prepare(`INSERT INTO cms_menu_items (menu_id, label, url, target, class_name, order_index, parent_id, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`)
                .bind(menuId, item.label, item.url, item.target ?? '_self', item.className ?? null, item.order, item.parentId ?? null, t, t)
                .first();
            if (!r)
                throw new Error('Failed to create menu item');
            return r;
        },
        async deleteItem(itemId) {
            await db.prepare('DELETE FROM cms_menu_items WHERE id = ?').bind(itemId).run();
        },
        async delete(menuId) {
            await db.prepare('DELETE FROM cms_menus WHERE id = ?').bind(menuId).run();
        },
    };
}
// ─── Tags ─────────────────────────────────────────────────────────────────────
function tagsClient(db) {
    return {
        async list() {
            const r = await db.prepare('SELECT * FROM cms_tags ORDER BY name').all();
            return r.results;
        },
        async create(data) {
            const t = now();
            const r = await db
                .prepare('INSERT INTO cms_tags (name, slug, created_at, updated_at) VALUES (?, ?, ?, ?) RETURNING *')
                .bind(data.name, data.slug, t, t).first();
            if (!r)
                throw new Error('Failed to create tag');
            return r;
        },
        async delete(id) {
            await db.prepare('DELETE FROM cms_tags WHERE id = ?').bind(id).run();
        },
    };
}
// ─── Categories ───────────────────────────────────────────────────────────────
function categoriesClient(db) {
    return {
        async list() {
            const r = await db.prepare('SELECT * FROM cms_categories ORDER BY name').all();
            return r.results;
        },
        async create(data) {
            const t = now();
            const r = await db
                .prepare(`INSERT INTO cms_categories (name, slug, description, parent_id, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?) RETURNING *`)
                .bind(data.name, data.slug, data.description ?? null, data.parentId ?? null, t, t)
                .first();
            if (!r)
                throw new Error('Failed to create category');
            return r;
        },
        async delete(id) {
            await db.prepare('DELETE FROM cms_categories WHERE id = ?').bind(id).run();
        },
    };
}
// ─── Sections ─────────────────────────────────────────────────────────────────
function sectionsClient(db) {
    return {
        async listByPage(page) {
            const r = await db
                .prepare('SELECT * FROM cms_sections WHERE page = ? ORDER BY order_index')
                .bind(page).all();
            return r.results;
        },
        async create(data) {
            const t = now();
            const r = await db
                .prepare(`INSERT INTO cms_sections (page, type, title, content, order_index, settings, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`)
                .bind(data.page, data.type, data.title ?? null, data.content ?? null, data.order ?? 0, data.settings ? JSON.stringify(data.settings) : null, t, t)
                .first();
            if (!r)
                throw new Error('Failed to create section');
            return r;
        },
        async update(id, data) {
            const t = now();
            const r = await db
                .prepare('UPDATE cms_sections SET title=?, content=?, order_index=?, updated_at=? WHERE id=? RETURNING *')
                .bind(data.title ?? null, data.content ?? null, data.order ?? 0, t, id)
                .first();
            if (!r)
                throw new Error(`Section ${id} not found`);
            return r;
        },
        async delete(id) {
            await db.prepare('DELETE FROM cms_sections WHERE id = ?').bind(id).run();
        },
    };
}
// ─── Widgets ──────────────────────────────────────────────────────────────────
function widgetsClient(db) {
    return {
        async listByArea(area) {
            const r = await db
                .prepare('SELECT * FROM cms_widgets WHERE area = ? ORDER BY order_index')
                .bind(area).all();
            return r.results;
        },
        async create(data) {
            const t = now();
            const r = await db
                .prepare(`INSERT INTO cms_widgets (name, area, type, content, order_index, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`)
                .bind(data.name, data.area, data.type, data.content ? JSON.stringify(data.content) : null, data.order ?? 0, t, t)
                .first();
            if (!r)
                throw new Error('Failed to create widget');
            return r;
        },
        async delete(id) {
            await db.prepare('DELETE FROM cms_widgets WHERE id = ?').bind(id).run();
        },
    };
}
// ─── Comments ─────────────────────────────────────────────────────────────────
function commentsClient(db) {
    return {
        async list(options = {}) {
            let sql = 'SELECT * FROM cms_comments WHERE 1=1';
            const binds = [];
            if (options.collection) {
                sql += ' AND collection = ?';
                binds.push(options.collection);
            }
            if (options.status) {
                sql += ' AND status = ?';
                binds.push(options.status);
            }
            sql += ' ORDER BY created_at DESC';
            const r = await db.prepare(sql).bind(...binds).all();
            return r.results;
        },
        async create(data) {
            const t = now();
            const r = await db
                .prepare(`INSERT INTO cms_comments (collection, entry_id, author, email, content, status, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, 'pending', ?, ?) RETURNING *`)
                .bind(data.collection, data.entryId, data.author, data.email, data.content, t, t)
                .first();
            if (!r)
                throw new Error('Failed to create comment');
            return r;
        },
        async updateStatus(id, status) {
            const r = await db
                .prepare('UPDATE cms_comments SET status = ?, updated_at = ? WHERE id = ? RETURNING *')
                .bind(status, now(), id).first();
            if (!r)
                throw new Error(`Comment ${id} not found`);
            return r;
        },
        async delete(id) {
            await db.prepare('DELETE FROM cms_comments WHERE id = ?').bind(id).run();
        },
    };
}
// ─── Forms ────────────────────────────────────────────────────────────────────
function formsClient(db) {
    return {
        async list() {
            const r = await db.prepare('SELECT * FROM cms_forms ORDER BY name').all();
            return r.results;
        },
        async get(id) {
            return db.prepare('SELECT * FROM cms_forms WHERE id = ?').bind(id).first();
        },
        async create(data) {
            const t = now();
            const r = await db
                .prepare('INSERT INTO cms_forms (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING *')
                .bind(data.name, data.slug, data.description ?? null, t, t).first();
            if (!r)
                throw new Error('Failed to create form');
            return r;
        },
        async delete(id) {
            await db.prepare('DELETE FROM cms_forms WHERE id = ?').bind(id).run();
        },
        async listFields(formId) {
            const r = await db
                .prepare('SELECT * FROM cms_form_fields WHERE form_id = ? ORDER BY order_index')
                .bind(formId).all();
            return r.results;
        },
        async addField(formId, data) {
            const t = now();
            const r = await db
                .prepare(`INSERT INTO cms_form_fields (form_id, label, type, required, placeholder, options, order_index, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`)
                .bind(formId, data.label, data.type, data.required ? 1 : 0, data.placeholder ?? null, data.options ? JSON.stringify(data.options) : null, data.order ?? 0, t, t)
                .first();
            if (!r)
                throw new Error('Failed to create field');
            return r;
        },
        async deleteField(fieldId) {
            await db.prepare('DELETE FROM cms_form_fields WHERE id = ?').bind(fieldId).run();
        },
        async listSubmissions(formId) {
            const r = await db
                .prepare('SELECT * FROM cms_form_submissions WHERE form_id = ? ORDER BY created_at DESC')
                .bind(formId).all();
            return r.results;
        },
    };
}
// ─── Dynamic Content Types ────────────────────────────────────────────────────
function contentTypesClient(db) {
    return {
        async list() {
            const r = await db.prepare('SELECT * FROM cms_content_types ORDER BY name').all();
            return r.results;
        },
        async get(id) {
            return db.prepare('SELECT * FROM cms_content_types WHERE id = ?').bind(id).first();
        },
        async getBySlug(slug) {
            return db.prepare('SELECT * FROM cms_content_types WHERE slug = ?').bind(slug).first();
        },
        async create(data) {
            const t = now();
            const r = await db
                .prepare('INSERT INTO cms_content_types (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING *')
                .bind(data.name, data.slug, data.description ?? null, t, t).first();
            if (!r)
                throw new Error('Failed to create content type');
            return r;
        },
        async delete(id) {
            await db.prepare('DELETE FROM cms_content_types WHERE id = ?').bind(id).run();
        },
        async listFields(contentTypeId) {
            const r = await db
                .prepare('SELECT * FROM cms_content_type_fields WHERE content_type_id = ? ORDER BY order_index')
                .bind(contentTypeId).all();
            return r.results;
        },
        async addField(contentTypeId, data) {
            const t = now();
            const r = await db
                .prepare(`INSERT INTO cms_content_type_fields
                  (content_type_id, name, label, type, required, placeholder, help_text, options, order_index, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`)
                .bind(contentTypeId, data.name, data.label, data.type, data.required ? 1 : 0, data.placeholder ?? null, data.helpText ?? null, data.options ? JSON.stringify(data.options) : null, data.order ?? 0, t, t)
                .first();
            if (!r)
                throw new Error('Failed to create field');
            return r;
        },
        async deleteField(fieldId) {
            await db.prepare('DELETE FROM cms_content_type_fields WHERE id = ?').bind(fieldId).run();
        },
    };
}
// ─── Entries (dynamic content type entries stored as JSON) ────────────────────
function entriesClient(db) {
    return {
        async list(contentTypeId, options = {}) {
            let sql = 'SELECT * FROM cms_entries WHERE content_type_id = ?';
            const binds = [contentTypeId];
            if (options.status) {
                sql += ' AND status = ?';
                binds.push(options.status);
            }
            sql += ' ORDER BY created_at DESC';
            if (options.limit) {
                sql += ' LIMIT ?';
                binds.push(options.limit);
            }
            const r = await db.prepare(sql).bind(...binds).all();
            return r.results;
        },
        async get(id) {
            return db.prepare('SELECT * FROM cms_entries WHERE id = ?').bind(id).first();
        },
        async create(contentTypeId, data, status = 'draft') {
            const t = now();
            const r = await db
                .prepare('INSERT INTO cms_entries (content_type_id, data, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING *')
                .bind(contentTypeId, JSON.stringify(data), status, t, t).first();
            if (!r)
                throw new Error('Failed to create entry');
            return r;
        },
        async update(id, data, status) {
            const existing = await db.prepare('SELECT * FROM cms_entries WHERE id = ?').bind(id).first();
            if (!existing)
                throw new Error(`Entry ${id} not found`);
            const merged = { ...JSON.parse(existing.data), ...data };
            const t = now();
            const r = await db
                .prepare('UPDATE cms_entries SET data = ?, status = ?, updated_at = ? WHERE id = ? RETURNING *')
                .bind(JSON.stringify(merged), status ?? existing.status, t, id).first();
            if (!r)
                throw new Error(`Entry ${id} not found`);
            return r;
        },
        async delete(id) {
            await db.prepare('DELETE FROM cms_entries WHERE id = ?').bind(id).run();
        },
    };
}
// ─── Media ────────────────────────────────────────────────────────────────────
function mediaDbClient(db) {
    return {
        async list(limit = 50, offset = 0) {
            const r = await db
                .prepare('SELECT * FROM cms_media ORDER BY created_at DESC LIMIT ? OFFSET ?')
                .bind(limit, offset).all();
            return r.results;
        },
        async create(data) {
            const t = now();
            const r = await db
                .prepare(`INSERT INTO cms_media (key, filename, content_type, size, url, alt, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`)
                .bind(data.key, data.filename, data.contentType, data.size, data.url, data.alt ?? null, t, t)
                .first();
            if (!r)
                throw new Error('Failed to save media entry');
            return r;
        },
        async delete(id) {
            await db.prepare('DELETE FROM cms_media WHERE id = ?').bind(id).run();
        },
    };
}
export function createSystemClient(db) {
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
    };
}
// ─── Cached clients ───────────────────────────────────────────────────────────────
function cachedMenuClient(db, state) {
    const base = menuClient(db);
    return {
        async list() {
            return state.getOrFetch('cms:menu:list', () => base.list(), { ttlSeconds: 120 });
        },
        async get(slug) {
            return state.getOrFetch(`cms:menu:${slug}`, () => base.get(slug), { ttlSeconds: 120 });
        },
        async create(data) {
            const result = await base.create(data);
            await state.invalidatePattern('cms:menu:');
            return result;
        },
        async addItem(menuId, item) {
            const result = await base.addItem(menuId, item);
            const menu = await db.prepare('SELECT slug FROM cms_menus WHERE id = ?').bind(menuId).first();
            if (menu)
                await state.invalidate(`cms:menu:${menu.slug}`);
            return result;
        },
        async deleteItem(itemId) {
            const item = await db.prepare('SELECT m.slug FROM cms_menu_items mi JOIN cms_menus m ON mi.menu_id = m.id WHERE mi.id = ?').bind(itemId).first();
            await base.deleteItem(itemId);
            if (item)
                await state.invalidate(`cms:menu:${item.slug}`);
        },
        async delete(menuId) {
            await base.delete(menuId);
            await state.invalidatePattern('cms:menu:');
        },
    };
}
function cachedTagsClient(db, state) {
    const base = tagsClient(db);
    return {
        async list() {
            return state.getOrFetch('cms:tags:list', () => base.list(), { ttlSeconds: 180 });
        },
        async create(data) {
            const result = await base.create(data);
            await state.invalidate('cms:tags:list');
            return result;
        },
        async delete(id) {
            await base.delete(id);
            await state.invalidate('cms:tags:list');
        },
    };
}
function cachedCategoriesClient(db, state) {
    const base = categoriesClient(db);
    return {
        async list() {
            return state.getOrFetch('cms:categories:list', () => base.list(), { ttlSeconds: 180 });
        },
        async create(data) {
            const result = await base.create(data);
            await state.invalidate('cms:categories:list');
            return result;
        },
        async delete(id) {
            await base.delete(id);
            await state.invalidate('cms:categories:list');
        },
    };
}
function cachedSectionsClient(db, state) {
    const base = sectionsClient(db);
    return {
        async listByPage(page) {
            return state.getOrFetch(`cms:sections:${page}`, () => base.listByPage(page), { ttlSeconds: 120 });
        },
        async create(data) {
            const result = await base.create(data);
            await state.invalidate(`cms:sections:${data.page}`);
            return result;
        },
        async update(id, data) {
            const section = await db.prepare('SELECT page FROM cms_sections WHERE id = ?').bind(id).first();
            const result = await base.update(id, data);
            if (section)
                await state.invalidate(`cms:sections:${section.page}`);
            return result;
        },
        async delete(id) {
            const section = await db.prepare('SELECT page FROM cms_sections WHERE id = ?').bind(id).first();
            await base.delete(id);
            if (section)
                await state.invalidate(`cms:sections:${section.page}`);
        },
    };
}
function cachedFormsClient(db, state) {
    const base = formsClient(db);
    return {
        async list() {
            return state.getOrFetch('cms:forms:list', () => base.list(), { ttlSeconds: 180 });
        },
        async get(id) {
            return state.getOrFetch(`cms:forms:${id}`, () => base.get(id));
        },
        async create(data) {
            const result = await base.create(data);
            await state.invalidate('cms:forms:list');
            return result;
        },
        async delete(id) {
            await base.delete(id);
            await state.invalidate('cms:forms:list');
            await state.invalidatePattern('cms:forms:');
        },
        async listFields(formId) {
            return state.getOrFetch(`cms:forms:${formId}:fields`, () => base.listFields(formId));
        },
        async addField(formId, data) {
            const result = await base.addField(formId, data);
            await state.invalidate(`cms:forms:${formId}:fields`);
            return result;
        },
        async deleteField(fieldId) {
            const field = await db.prepare('SELECT form_id FROM cms_form_fields WHERE id = ?').bind(fieldId).first();
            await base.deleteField(fieldId);
            if (field)
                await state.invalidate(`cms:forms:${field.form_id}:fields`);
        },
        async listSubmissions(formId) {
            return state.getOrFetch(`cms:forms:${formId}:submissions`, () => base.listSubmissions(formId), { ttlSeconds: 30 });
        },
    };
}
function cachedContentTypesClient(db, state) {
    const base = contentTypesClient(db);
    return {
        async list() {
            return state.getOrFetch('cms:contentTypes:list', () => base.list(), { ttlSeconds: 300 });
        },
        async get(id) {
            return state.getOrFetch(`cms:contentTypes:${id}`, () => base.get(id));
        },
        async getBySlug(slug) {
            return state.getOrFetch(`cms:contentTypes:slug:${slug}`, () => base.getBySlug(slug), { ttlSeconds: 300 });
        },
        async create(data) {
            const result = await base.create(data);
            await state.invalidate('cms:contentTypes:list');
            return result;
        },
        async delete(id) {
            await base.delete(id);
            await state.invalidate('cms:contentTypes:list');
            await state.invalidatePattern('cms:contentTypes:');
        },
        async listFields(contentTypeId) {
            return state.getOrFetch(`cms:contentTypes:${contentTypeId}:fields`, () => base.listFields(contentTypeId));
        },
        async addField(contentTypeId, data) {
            const result = await base.addField(contentTypeId, data);
            await state.invalidate(`cms:contentTypes:${contentTypeId}:fields`);
            return result;
        },
        async deleteField(fieldId) {
            const field = await db.prepare('SELECT content_type_id FROM cms_content_type_fields WHERE id = ?').bind(fieldId).first();
            await base.deleteField(fieldId);
            if (field)
                await state.invalidate(`cms:contentTypes:${field.content_type_id}:fields`);
        },
    };
}
function cachedEntriesClient(db, state) {
    const base = entriesClient(db);
    return {
        async list(contentTypeId, options = {}) {
            const key = `cms:entries:${contentTypeId}:${options.status || 'all'}`;
            return state.getOrFetch(key, () => base.list(contentTypeId, options), { ttlSeconds: 60 });
        },
        async get(id) {
            return state.getOrFetch(`cms:entries:${id}`, () => base.get(id), { ttlSeconds: 30 });
        },
        async create(contentTypeId, data, status = 'draft') {
            const result = await base.create(contentTypeId, data, status);
            await state.invalidate(`cms:entries:${contentTypeId}:all`);
            return result;
        },
        async update(id, data, status) {
            const entry = await base.get(id);
            const result = await base.update(id, data, status);
            if (entry) {
                await state.invalidate(`cms:entries:${id}`);
                await state.invalidate(`cms:entries:${entry.content_type_id}:all`);
            }
            return result;
        },
        async delete(id) {
            const entry = await base.get(id);
            await base.delete(id);
            if (entry) {
                await state.invalidate(`cms:entries:${id}`);
                await state.invalidate(`cms:entries:${entry.content_type_id}:all`);
            }
        },
    };
}
function cachedMediaDbClient(db, state) {
    const base = mediaDbClient(db);
    return {
        async list(limit = 50, offset = 0) {
            return state.getOrFetch(`cms:media:list:${limit}:${offset}`, () => base.list(limit, offset), { ttlSeconds: 60 });
        },
        async create(data) {
            const result = await base.create(data);
            await state.invalidatePattern('cms:media:');
            return result;
        },
        async delete(id) {
            await base.delete(id);
            await state.invalidatePattern('cms:media:');
        },
    };
}
function cachedCommentsClient(db, state) {
    const base = commentsClient(db);
    return {
        async list(options = {}) {
            const key = `cms:comments:${options.collection || 'all'}:${options.status || 'all'}`;
            return state.getOrFetch(key, () => base.list(options), { ttlSeconds: 30 });
        },
        async create(data) {
            const result = await base.create(data);
            await state.invalidatePattern('cms:comments:');
            return result;
        },
        async updateStatus(id, status) {
            const result = await base.updateStatus(id, status);
            await state.invalidatePattern('cms:comments:');
            return result;
        },
        async delete(id) {
            await base.delete(id);
            await state.invalidatePattern('cms:comments:');
        },
    };
}
function cachedWidgetsClient(db, state) {
    const base = widgetsClient(db);
    return {
        async listByArea(area) {
            return state.getOrFetch(`cms:widgets:${area}`, () => base.listByArea(area), { ttlSeconds: 120 });
        },
        async create(data) {
            const result = await base.create(data);
            await state.invalidate(`cms:widgets:${data.area}`);
            return result;
        },
        async delete(id) {
            const widget = await db.prepare('SELECT area FROM cms_widgets WHERE id = ?').bind(id).first();
            await base.delete(id);
            if (widget)
                await state.invalidate(`cms:widgets:${widget.area}`);
        },
    };
}
export function createCachedSystemClient(db, kv) {
    const memoryCache = new Map();
    const state = {
        async getOrFetch(key, fetcher, options) {
            const { ttlSeconds = 60, useCache = true } = options ?? {};
            if (useCache) {
                const memEntry = memoryCache.get(key);
                if (memEntry && Date.now() - memEntry.timestamp < memEntry.ttl * 1000) {
                    return memEntry.data;
                }
                try {
                    const kvVal = await kv.get(key, 'text');
                    if (kvVal) {
                        const data = JSON.parse(kvVal);
                        memoryCache.set(key, { data, timestamp: Date.now(), ttl: ttlSeconds });
                        return data;
                    }
                }
                catch { }
            }
            const data = await fetcher();
            if (useCache) {
                memoryCache.set(key, { data, timestamp: Date.now(), ttl: ttlSeconds });
                await kv.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds });
            }
            return data;
        },
        async invalidate(key) {
            memoryCache.delete(key);
            await kv.delete(key);
        },
        async invalidatePattern(prefix) {
            for (const k of memoryCache.keys()) {
                if (k.startsWith(prefix))
                    memoryCache.delete(k);
            }
            const list = await kv.list({ prefix });
            await Promise.all(list.keys.map(k => kv.delete(k.name)));
        },
    };
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
    };
}
//# sourceMappingURL=client.js.map