import type { AstroIntegration } from 'astro'
import type { CMSConfig } from '../config/types.js'
import { validateConfig } from '../config/schema.js'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
// admin .astro files live in src/admin and are shipped as source in the npm package
const adminDir = resolve(__dirname, '../../src/admin')
const middlewareEntry = pathToFileURL(resolve(__dirname, 'middleware.js')).href

export function cms(config: CMSConfig): AstroIntegration {
  const validated = validateConfig(config)

  return {
    name: '@geniusofdigital/astro-cms',
    hooks: {
      'astro:config:setup'(ctx) {
        const { injectRoute, updateConfig, addMiddleware, logger } = ctx
        // injectTypes available in Astro >=4.14 — optional for older versions
        const injectTypes = (ctx as any).injectTypes as
          ((opts: { filename: string; content: string }) => void) | undefined

        logger.info('CMS config validated ✓')

        // Virtual module — makes user config available inside admin .astro pages
        updateConfig({
          vite: {
            plugins: [{
              name: 'astro-cms-virtual',
              resolveId(id: string) {
                if (id === 'virtual:astro-cms/config') return '\0virtual:astro-cms/config'
              },
              load(id: string) {
                if (id === '\0virtual:astro-cms/config') {
                  return `export default ${JSON.stringify(validated)}`
                }
              },
            }],
          },
        })

        // TypeScript types for virtual:astro-cms/config (Astro >=4.14)
        injectTypes?.({
          filename: 'astro-cms.d.ts',
          content: [
            "declare module 'virtual:astro-cms/config' {",
            "  const config: import('@geniusofdigital/astro-cms/config').CMSConfig",
            "  export default config",
            "}",
          ].join('\n'),
        })

        // Auth middleware — protects all /admin routes
        addMiddleware({ entrypoint: middlewareEntry, order: 'pre' })

        // Auth routes
        injectRoute({ pattern: '/admin/login',                  entrypoint: `${adminDir}/login.astro` })
        injectRoute({ pattern: '/admin/logout',                 entrypoint: `${adminDir}/logout.astro` })

        // Inject admin routes — zero files in user project
        injectRoute({ pattern: '/admin',                        entrypoint: `${adminDir}/index.astro` })
        injectRoute({ pattern: '/admin/media',                  entrypoint: `${adminDir}/media.astro` })
        injectRoute({ pattern: '/admin/[collection]',           entrypoint: `${adminDir}/collection.astro` })
        injectRoute({ pattern: '/admin/[collection]/new',       entrypoint: `${adminDir}/entry-form.astro` })
        injectRoute({ pattern: '/admin/[collection]/[id]',      entrypoint: `${adminDir}/entry-form.astro` })

        // Gestion system routes
        injectRoute({ pattern: '/admin/system/tags',            entrypoint: `${adminDir}/system/tags.astro` })
        injectRoute({ pattern: '/admin/system/categories',      entrypoint: `${adminDir}/system/categories.astro` })
        injectRoute({ pattern: '/admin/system/menu',            entrypoint: `${adminDir}/system/menu.astro` })
        injectRoute({ pattern: '/admin/system/menu/[id]',       entrypoint: `${adminDir}/system/menu/[id].astro` })
        injectRoute({ pattern: '/admin/system/sections',        entrypoint: `${adminDir}/system/sections.astro` })
        injectRoute({ pattern: '/admin/system/widgets',         entrypoint: `${adminDir}/system/widgets.astro` })
        injectRoute({ pattern: '/admin/system/comments',        entrypoint: `${adminDir}/system/comments.astro` })

        // Admin section routes
        injectRoute({ pattern: '/admin/system/content-types',   entrypoint: `${adminDir}/system/content-types.astro` })
        injectRoute({ pattern: '/admin/system/users',           entrypoint: `${adminDir}/system/users.astro` })
        injectRoute({ pattern: '/admin/system/settings',        entrypoint: `${adminDir}/system/settings.astro` })
      },
    },
  }
}
