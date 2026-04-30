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
//# sourceMappingURL=client.js.map