import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export interface WranglerBindings {
  d1?: { binding: string; database_name: string; database_id: string }[]
  r2?: { binding: string; bucket_name: string }[]
  kv?: { binding: string; id: string }[]
}

export async function readWranglerToml(cwd: string): Promise<string> {
  const path = join(cwd, 'wrangler.toml')
  if (!existsSync(path)) throw new Error(`wrangler.toml not found at ${path}`)
  return readFile(path, 'utf-8')
}

export function parseWranglerBindings(toml: string): WranglerBindings {
  const result: WranglerBindings = {}

  // D1 databases
  const d1Match = toml.match(/\[\[d1_databases\]\][^[]+/g)
  if (d1Match) {
    result.d1 = d1Match.map((block) => ({
      binding: extractTomlValue(block, 'binding') ?? '',
      database_name: extractTomlValue(block, 'database_name') ?? '',
      database_id: extractTomlValue(block, 'database_id') ?? '',
    }))
  }

  // R2 buckets
  const r2Match = toml.match(/\[\[r2_buckets\]\][^[]+/g)
  if (r2Match) {
    result.r2 = r2Match.map((block) => ({
      binding: extractTomlValue(block, 'binding') ?? '',
      bucket_name: extractTomlValue(block, 'bucket_name') ?? '',
    }))
  }

  // KV namespaces
  const kvMatch = toml.match(/\[\[kv_namespaces\]\][^[]+/g)
  if (kvMatch) {
    result.kv = kvMatch.map((block) => ({
      binding: extractTomlValue(block, 'binding') ?? '',
      id: extractTomlValue(block, 'id') ?? '',
    }))
  }

  return result
}

function extractTomlValue(block: string, key: string): string | undefined {
  const match = block.match(new RegExp(`${key}\\s*=\\s*"([^"]+)"`))
  return match?.[1]
}

export async function appendToWranglerToml(cwd: string, additions: string): Promise<void> {
  const path = join(cwd, 'wrangler.toml')
  const existing = existsSync(path) ? await readFile(path, 'utf-8') : ''
  await writeFile(path, existing + '\n' + additions, 'utf-8')
}

export function validateBindings(bindings: WranglerBindings): string[] {
  const warnings: string[] = []
  if (!bindings.d1 || bindings.d1.length === 0) {
    warnings.push('No D1 database binding found — cms.{collection}.find() will fail at runtime')
  }
  return warnings
}
