import { validateConfig } from '../config/schema.js';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
// admin .astro files live in src/admin and are shipped as source in the npm package
const adminDir = resolve(__dirname, '../../src/admin');
const middlewareEntry = '@geniusofdigital/astro-cms/middleware';
export function cms(config) {
    const validated = validateConfig(config);
    return {
        name: '@geniusofdigital/astro-cms',
        hooks: {
            'astro:config:setup'(ctx) {
                const { injectRoute, updateConfig, addMiddleware, logger } = ctx;
                // injectTypes available in Astro >=4.14 — optional for older versions
                const injectTypes = ctx.injectTypes;
                logger.info('CMS config validated ✓');
                // Virtual module — makes user config available inside admin .astro pages
                updateConfig({
                    vite: {
                        plugins: [{
                                name: 'astro-cms-virtual',
                                resolveId(id) {
                                    if (id === 'virtual:astro-cms/config')
                                        return '\0virtual:astro-cms/config';
                                },
                                load(id) {
                                    if (id === '\0virtual:astro-cms/config') {
                                        return `export default ${JSON.stringify(validated)}`;
                                    }
                                },
                            }],
                    },
                });
                // TypeScript types for virtual:astro-cms/config (Astro >=4.14)
                injectTypes?.({
                    filename: 'astro-cms.d.ts',
                    content: [
                        "declare module 'virtual:astro-cms/config' {",
                        "  const config: import('@geniusofdigital/astro-cms/config').CMSConfig",
                        "  export default config",
                        "}",
                    ].join('\n'),
                });
                // Auth middleware — protects all /admin routes
                addMiddleware({ entrypoint: middlewareEntry, order: 'pre' });
                const route = (pattern, file) => injectRoute({ pattern, entrypoint: file, prerender: false });
                // Auth routes
                route('/admin/login', `${adminDir}/login.astro`);
                route('/admin/logout', `${adminDir}/logout.astro`);
                // Content routes
                route('/admin', `${adminDir}/index.astro`);
                route('/admin/media', `${adminDir}/media.astro`);
                route('/admin/[collection]', `${adminDir}/collection.astro`);
                route('/admin/[collection]/new', `${adminDir}/entry-form.astro`);
                route('/admin/[collection]/[id]', `${adminDir}/entry-form.astro`);
                // Gestion system routes
                route('/admin/system/tags', `${adminDir}/system/tags.astro`);
                route('/admin/system/categories', `${adminDir}/system/categories.astro`);
                route('/admin/system/menu', `${adminDir}/system/menu.astro`);
                route('/admin/system/menu/[id]', `${adminDir}/system/menu/[id].astro`);
                route('/admin/system/sections', `${adminDir}/system/sections.astro`);
                route('/admin/system/widgets', `${adminDir}/system/widgets.astro`);
                route('/admin/system/comments', `${adminDir}/system/comments.astro`);
                route('/admin/system/forms', `${adminDir}/system/forms.astro`);
                route('/admin/system/forms/[id]', `${adminDir}/system/forms/[id].astro`);
                // Admin section routes
                route('/admin/system/content-types', `${adminDir}/system/content-types.astro`);
                route('/admin/system/content-types/[id]', `${adminDir}/system/content-types/[id].astro`);
                route('/admin/system/users', `${adminDir}/system/users.astro`);
                route('/admin/system/settings', `${adminDir}/system/settings.astro`);
            },
        },
    };
}
//# sourceMappingURL=integration.js.map