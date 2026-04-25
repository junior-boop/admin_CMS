import type { CollectionDefinition, InferCollectionRecord } from '../config/types.js'

export interface FindOptions {
  where?: Record<string, string | number | boolean | null>
  limit?: number
  offset?: number
  orderBy?: { field: string; direction?: 'asc' | 'desc' }
}

export interface CollectionClient<TRecord> {
  find(options?: FindOptions): Promise<TRecord[]>
  findOne(id: number): Promise<TRecord | null>
  create(data: Omit<TRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TRecord>
  update(id: number, data: Partial<Omit<TRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TRecord>
  delete(id: number): Promise<void>
}

export function createCollectionClient<C extends CollectionDefinition>(
  db: D1Database,
  tableName: string,
  _definition: C
): CollectionClient<InferCollectionRecord<C>> {
  type TRecord = InferCollectionRecord<C>

  function buildWhereClause(where: FindOptions['where']): { sql: string; values: unknown[] } {
    if (!where || Object.keys(where).length === 0) return { sql: '', values: [] }
    const entries = Object.entries(where)
    const sql = 'WHERE ' + entries.map(([k]) => `${k} = ?`).join(' AND ')
    const values = entries.map(([, v]) => v)
    return { sql, values }
  }

  function rowToRecord(row: Record<string, unknown>): TRecord {
    return row as TRecord
  }

  return {
    async find(options: FindOptions = {}) {
      const { where, limit = 100, offset = 0, orderBy } = options
      const { sql: whereSql, values: whereValues } = buildWhereClause(where)
      const orderSql = orderBy
        ? `ORDER BY ${orderBy.field} ${orderBy.direction ?? 'asc'}`
        : 'ORDER BY id asc'

      const sql = `SELECT * FROM ${tableName} ${whereSql} ${orderSql} LIMIT ? OFFSET ?`
      const result = await db.prepare(sql).bind(...whereValues, limit, offset).all()
      return (result.results as Record<string, unknown>[]).map(rowToRecord)
    },

    async findOne(id: number) {
      const result = await db
        .prepare(`SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`)
        .bind(id)
        .first<Record<string, unknown>>()
      return result ? rowToRecord(result) : null
    },

    async create(data: Omit<TRecord, 'id' | 'createdAt' | 'updatedAt'>) {
      const now = new Date().toISOString()
      const fields = Object.keys(data)
      const values = Object.values(data)
      const placeholders = fields.map(() => '?').join(', ')
      const sql = `
        INSERT INTO ${tableName} (${fields.join(', ')}, created_at, updated_at)
        VALUES (${placeholders}, ?, ?)
        RETURNING *
      `
      const result = await db.prepare(sql).bind(...values, now, now).first<Record<string, unknown>>()
      if (!result) throw new Error(`Failed to create record in ${tableName}`)
      return rowToRecord(result)
    },

    async update(id: number, data: Partial<Omit<TRecord, 'id' | 'createdAt' | 'updatedAt'>>) {
      const now = new Date().toISOString()
      const entries = Object.entries(data)
      if (entries.length === 0) throw new Error('update() called with no fields')
      const setClauses = entries.map(([k]) => `${k} = ?`).join(', ')
      const values = entries.map(([, v]) => v)
      const sql = `
        UPDATE ${tableName}
        SET ${setClauses}, updated_at = ?
        WHERE id = ?
        RETURNING *
      `
      const result = await db.prepare(sql).bind(...values, now, id).first<Record<string, unknown>>()
      if (!result) throw new Error(`Record ${id} not found in ${tableName}`)
      return rowToRecord(result)
    },

    async delete(id: number) {
      await db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(id).run()
    },
  }
}
