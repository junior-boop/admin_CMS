# Astro CMS

CMS headless pour **Astro + Cloudflare Workers** (D1, R2, KV).

## Installation

```bash
npm install @geniusofdigital/astro-cms
```

## Configuration

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import { cms } from '@geniusofdigital/astro-cms/astro'
import { defineCollections } from '@geniusofdigital/astro-cms/config'

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    cms({
      name: 'Mon CMS',
      collections: defineCollections({
        articles: {
          label: 'Articles',
          fields: {
            title: { type: 'text', required: true },
            slug: { type: 'text', required: true },
            content: { type: 'richtext' },
            published: { type: 'boolean', defaultValue: false },
            category: { type: 'relation', collection: 'categories' },
            tags: { type: 'relation', collection: 'tags' },
            thumbnail: { type: 'media' },
          },
        },
        pages: {
          label: 'Pages',
          fields: {
            title: { type: 'text', required: true },
            body: { type: 'richtext' },
          },
        },
      }),
    }),
  ],
})
```

## Types de champs disponibles

| Type | Description |
|------|-------------|
| `text` | Texte simple (maxLength optionnel) |
| `richtext` | Éditeur WYSIWYG |
| `number` | Nombre (min/max optionnel) |
| `boolean` | Toggle |
| `date` | Date |
| `select` | Liste déroulante (options requises) |
| `media` | Fichier (R2) |
| `relation` | Référence vers une autre collection |

Chaque collection reçoit automatiquement les champs système : `id`, `created_at`, `updated_at`.

## Routes admin injectées

| Route | Description |
|-------|-----------|
| `/admin` | Dashboard |
| `/admin/login` | Connexion |
| `/admin/logout` | Déconnexion |
| `/admin/media` | Médiathèque |
| `/admin/[collection]` | Liste des entrées |
| `/admin/[collection]/new` | Créer une entrée |
| `/admin/[collection]/[id]` | Modifier une entrée |
| `/admin/system/tags` | Gestion des tags |
| `/admin/system/categories` | Gestion des catégories |
| `/admin/system/menu` | Gestion du menu |
| `/admin/system/sections` | Sections de page |
| `/admin/system/widgets` | Widgets |
| `/admin/system/comments` | Commentaires |
| `/admin/system/content-types` | Types de contenu |
| `/admin/system/users` | Utilisateurs |
| `/admin/system/settings` | Paramètres |

## Schéma système (D1)

```sql
cms_menus       -- Navigation
cms_menu_items  -- Items de menu (hiérarchique)
cms_tags       -- Tags
cms_categories -- Catégories (hiérarchiques)
cms_sections   -- Sections de page
cms_widgets   -- Widgets
cms_comments   -- Commentaires
cms_media     -- Métadonnées des fichiers (R2)
```

## API runtime

Accès aux données côté frontend :

```typescript
import { createCMSClient } from '@geniusofdigital/astro-cms'

const client = createCMSClient(env.DB)
const articles = await client.collections.articles.find({ where: { published: true } })
```

## Authentification

L'authentification utilise **Cloudflare KV** pour les sessions. Les utilisateurs admin sont gérés dans `/admin/system/users`.

## Développement local

```bash
npm run dev        # Build continu
npm run typecheck  # Vérification TypeScript
```

## Build

```bash
npm run build
```

Le package publie `dist/`, `bin/`, et `src/admin/` vers npm.

## API package

| Export | Description |
|--------|-------------|
| `@geniusofdigital/astro-cms` | Client runtime |
| `@geniusofdigital/astro-cms/config` | `defineConfig`, `defineCollections` |
| `@geniusofdigital/astro-cms/astro` | Intégration Astro |
| `@geniusofdigital/astro-cms/api` | Helpers API |
| `@geniusofdigital/astro-cms/system` | Clients système |