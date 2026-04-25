export function createCollectionClient(db, tableName, _definition) {
    function buildWhereClause(where) {
        if (!where || Object.keys(where).length === 0)
            return { sql: '', values: [] };
        const entries = Object.entries(where);
        const sql = 'WHERE ' + entries.map(([k]) => `${k} = ?`).join(' AND ');
        const values = entries.map(([, v]) => v);
        return { sql, values };
    }
    function rowToRecord(row) {
        return row;
    }
    return {
        async find(options = {}) {
            const { where, limit = 100, offset = 0, orderBy } = options;
            const { sql: whereSql, values: whereValues } = buildWhereClause(where);
            const orderSql = orderBy
                ? `ORDER BY ${orderBy.field} ${orderBy.direction ?? 'asc'}`
                : 'ORDER BY id asc';
            const sql = `SELECT * FROM ${tableName} ${whereSql} ${orderSql} LIMIT ? OFFSET ?`;
            const result = await db.prepare(sql).bind(...whereValues, limit, offset).all();
            return result.results.map(rowToRecord);
        },
        async findOne(id) {
            const result = await db
                .prepare(`SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`)
                .bind(id)
                .first();
            return result ? rowToRecord(result) : null;
        },
        async create(data) {
            const now = new Date().toISOString();
            const fields = Object.keys(data);
            const values = Object.values(data);
            const placeholders = fields.map(() => '?').join(', ');
            const sql = `
        INSERT INTO ${tableName} (${fields.join(', ')}, created_at, updated_at)
        VALUES (${placeholders}, ?, ?)
        RETURNING *
      `;
            const result = await db.prepare(sql).bind(...values, now, now).first();
            if (!result)
                throw new Error(`Failed to create record in ${tableName}`);
            return rowToRecord(result);
        },
        async update(id, data) {
            const now = new Date().toISOString();
            const entries = Object.entries(data);
            if (entries.length === 0)
                throw new Error('update() called with no fields');
            const setClauses = entries.map(([k]) => `${k} = ?`).join(', ');
            const values = entries.map(([, v]) => v);
            const sql = `
        UPDATE ${tableName}
        SET ${setClauses}, updated_at = ?
        WHERE id = ?
        RETURNING *
      `;
            const result = await db.prepare(sql).bind(...values, now, id).first();
            if (!result)
                throw new Error(`Record ${id} not found in ${tableName}`);
            return rowToRecord(result);
        },
        async delete(id) {
            await db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(id).run();
        },
    };
}
//# sourceMappingURL=collections.js.map