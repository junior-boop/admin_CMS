import { resolve, join } from 'node:path'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { generate } from './generator.js'
import { readWranglerToml, parseWranglerBindings, validateBindings } from './wrangler.js'
import { validateConfig } from '../config/schema.js'

const cwd = process.cwd()
const args = process.argv.slice(2)
const command = args[0]

async function loadUserConfig() {
  const candidates = [
    join(cwd, 'cms.config.ts'),
    join(cwd, 'cms.config.js'),
    join(cwd, 'cms.config.mjs'),
  ]
  const configPath = candidates.find(existsSync)
  if (!configPath) {
    throw new Error(
      'No cms.config.ts found. Run `astro-cms init` to create one.'
    )
  }
  // Use dynamic import — works with tsx/bun/jiti at runtime
  const mod = await import(resolve(configPath))
  return mod.default ?? mod
}

// ─── Commands ─────────────────────────────────────────────────────────────────

async function cmdInit() {
  const configPath = join(cwd, 'cms.config.ts')
  if (existsSync(configPath)) {
    console.log('cms.config.ts already exists.')
    return
  }
  const template = `import { defineConfig, defineCollections, defineFields } from '@geniusofdigital/astro-cms/config'

export default defineConfig({
  collections: {
    articles: defineCollections({
      label: 'Articles',
      fields: {
        title: defineFields.text({ required: true, label: 'Title' }),
        body: defineFields.richtext({ label: 'Content' }),
        publishedAt: defineFields.date({ label: 'Published At' }),
      },
    }),
  },
})
`
  await writeFile(configPath, template, 'utf-8')
  console.log('Created cms.config.ts')
  console.log('Edit it, then run: astro-cms generate')
}

async function cmdGenerate() {
  console.log('Loading config...')
  const raw = await loadUserConfig()
  const config = validateConfig(raw)
  console.log(`Found ${Object.keys(config.collections).length} collection(s)`)
  await generate(config, cwd)
  console.log('Done. Apply the migration with:')
  console.log('  wrangler d1 migrations apply <DATABASE_NAME> --local')
}

async function cmdValidate() {
  console.log('Validating config...')
  const raw = await loadUserConfig()
  validateConfig(raw) // throws if invalid

  console.log('Config is valid.')

  try {
    const toml = await readWranglerToml(cwd)
    const bindings = parseWranglerBindings(toml)
    const warnings = validateBindings(bindings)
    if (warnings.length > 0) {
      console.warn('\nWarnings:')
      for (const w of warnings) console.warn(`  ! ${w}`)
    } else {
      console.log('wrangler.toml bindings look good.')
    }
  } catch {
    console.warn('Could not read wrangler.toml — skipping binding check.')
  }
}

// ─── Entrypoint ───────────────────────────────────────────────────────────────

async function main() {
  switch (command) {
    case 'init':
      await cmdInit()
      break
    case 'generate':
      await cmdGenerate()
      break
    case 'validate':
      await cmdValidate()
      break
    default:
      console.log(`astro-cms <command>

Commands:
  init       Create a starter cms.config.ts
  generate   Generate SQL migrations and TypeScript types from your config
  validate   Validate your config and wrangler.toml bindings
`)
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
