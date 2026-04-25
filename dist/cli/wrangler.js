import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
export async function readWranglerToml(cwd) {
    const path = join(cwd, 'wrangler.toml');
    if (!existsSync(path))
        throw new Error(`wrangler.toml not found at ${path}`);
    return readFile(path, 'utf-8');
}
export function parseWranglerBindings(toml) {
    const result = {};
    // D1 databases
    const d1Match = toml.match(/\[\[d1_databases\]\][^[]+/g);
    if (d1Match) {
        result.d1 = d1Match.map((block) => ({
            binding: extractTomlValue(block, 'binding') ?? '',
            database_name: extractTomlValue(block, 'database_name') ?? '',
            database_id: extractTomlValue(block, 'database_id') ?? '',
        }));
    }
    // R2 buckets
    const r2Match = toml.match(/\[\[r2_buckets\]\][^[]+/g);
    if (r2Match) {
        result.r2 = r2Match.map((block) => ({
            binding: extractTomlValue(block, 'binding') ?? '',
            bucket_name: extractTomlValue(block, 'bucket_name') ?? '',
        }));
    }
    // KV namespaces
    const kvMatch = toml.match(/\[\[kv_namespaces\]\][^[]+/g);
    if (kvMatch) {
        result.kv = kvMatch.map((block) => ({
            binding: extractTomlValue(block, 'binding') ?? '',
            id: extractTomlValue(block, 'id') ?? '',
        }));
    }
    return result;
}
function extractTomlValue(block, key) {
    const match = block.match(new RegExp(`${key}\\s*=\\s*"([^"]+)"`));
    return match?.[1];
}
export async function appendToWranglerToml(cwd, additions) {
    const path = join(cwd, 'wrangler.toml');
    const existing = existsSync(path) ? await readFile(path, 'utf-8') : '';
    await writeFile(path, existing + '\n' + additions, 'utf-8');
}
export function validateBindings(bindings) {
    const warnings = [];
    if (!bindings.d1 || bindings.d1.length === 0) {
        warnings.push('No D1 database binding found — cms.{collection}.find() will fail at runtime');
    }
    return warnings;
}
//# sourceMappingURL=wrangler.js.map