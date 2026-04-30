import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export interface WranglerBindings {
  d1?: { binding: string; database_name: string; database_id: string }[]
  r2?: { binding: string; bucket_name: string }[]
  kv?: { binding: string; id: string }[]
}

// ─── File discovery ───────────────────────────────────────────────────────────

type WranglerFormat = 'jsonc' | 'toml'

function findWranglerFile(cwd: string): { path: string; format: WranglerFormat } | null {
  const jsonc = join(cwd, 'wrangler.jsonc')
  if (existsSync(jsonc)) return { path: jsonc, format: 'jsonc' }
  const json = join(cwd, 'wrangler.json')
  if (existsSync(json)) return { path: json, format: 'jsonc' }
  const toml = join(cwd, 'wrangler.toml')
  if (existsSync(toml)) return { path: toml, format: 'toml' }
  return null
}

// ─── JSONC parser (strips // and /* */ comments before JSON.parse) ────────────

function stripJsoncComments(src: string): string {
  let result = ''
  let i = 0
  let inString = false

  while (i < src.length) {
    const ch = src[i]!

    if (inString) {
      result += ch
      if (ch === '\\') { result += src[++i] ?? ''; i++; continue }
      if (ch === '"') inString = false
      i++
      continue
    }

    if (ch === '"') { inString = true; result += ch; i++; continue }

    // Line comment
    if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++
      continue
    }

    // Block comment
    if (ch === '/' && src[i + 1] === '*') {
      i += 2
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++
      i += 2
      continue
    }

    result += ch
    i++
  }

  return result
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseJsoncBindings(raw: string): WranglerBindings {
  const json = JSON.parse(stripJsoncComments(raw))
  const result: WranglerBindings = {}

  if (Array.isArray(json.d1_databases)) {
    result.d1 = json.d1_databases.map((d: Record<string, string>) => ({
      binding:       d['binding']       ?? '',
      database_name: d['database_name'] ?? '',
      database_id:   d['database_id']   ?? '',
    }))
  }

  if (Array.isArray(json.r2_buckets)) {
    result.r2 = json.r2_buckets.map((b: Record<string, string>) => ({
      binding:     b['binding']     ?? '',
      bucket_name: b['bucket_name'] ?? '',
    }))
  }

  if (Array.isArray(json.kv_namespaces)) {
    result.kv = json.kv_namespaces.map((k: Record<string, string>) => ({
      binding: k['binding'] ?? '',
      id:      k['id']      ?? '',
    }))
  }

  return result
}

function parseTomlBindings(toml: string): WranglerBindings {
  const result: WranglerBindings = {}

  const d1Match = toml.match(/\[\[d1_databases\]\][^[]+/g)
  if (d1Match) {
    result.d1 = d1Match.map((block) => ({
      binding:       extractTomlValue(block, 'binding')       ?? '',
      database_name: extractTomlValue(block, 'database_name') ?? '',
      database_id:   extractTomlValue(block, 'database_id')   ?? '',
    }))
  }

  const r2Match = toml.match(/\[\[r2_buckets\]\][^[]+/g)
  if (r2Match) {
    result.r2 = r2Match.map((block) => ({
      binding:     extractTomlValue(block, 'binding')     ?? '',
      bucket_name: extractTomlValue(block, 'bucket_name') ?? '',
    }))
  }

  const kvMatch = toml.match(/\[\[kv_namespaces\]\][^[]+/g)
  if (kvMatch) {
    result.kv = kvMatch.map((block) => ({
      binding: extractTomlValue(block, 'binding') ?? '',
      id:      extractTomlValue(block, 'id')      ?? '',
    }))
  }

  return result
}

function extractTomlValue(block: string, key: string): string | undefined {
  return block.match(new RegExp(`${key}\\s*=\\s*"([^"]+)"`))?.[1]
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function readWranglerConfig(cwd: string): Promise<{ raw: string; format: WranglerFormat }> {
  const found = findWranglerFile(cwd)
  if (!found) throw new Error('No wrangler.jsonc, wrangler.json, or wrangler.toml found.')
  const raw = await readFile(found.path, 'utf-8')
  return { raw, format: found.format }
}

/** @deprecated use readWranglerConfig */
export async function readWranglerToml(cwd: string): Promise<string> {
  const { raw } = await readWranglerConfig(cwd)
  return raw
}

export function parseWranglerBindings(rawOrToml: string, format: WranglerFormat = 'toml'): WranglerBindings {
  return format === 'jsonc' ? parseJsoncBindings(rawOrToml) : parseTomlBindings(rawOrToml)
}

export function validateBindings(bindings: WranglerBindings): string[] {
  const warnings: string[] = []
  if (!bindings.d1 || bindings.d1.length === 0) {
    warnings.push('No D1 database binding found — cms.{collection}.find() will fail at runtime')
  }
  return warnings
}
