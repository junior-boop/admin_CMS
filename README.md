# @geniusofdigital/astro-cms

CMS headless type-safe pour **Astro + Cloudflare Workers** (D1, R2, KV). Zéro fichier à créer dans votre projet — toute l'UI admin est injectée automatiquement.

## Comment ça fonctionne

```
Cloudflare Workers (runtime)
  ├── D1  → stockage des collections + système
  ├── R2  → stockage des médias
  └── KV  → cache (optionnel)

Astro (build)
  ├── Integration → injecte 17 routes admin + middleware auth
  ├── src/admin/  → UI complète de l'administration
  └── Virtual module → partage la config entre les pages

CLI (Node)
  └── astro-cms generate → migrations SQL + types TypeScript
```

---

## Installation

```bash
npm install @geniusofdigital/astro-cms
```

**Prérequis :** Astro >= 4.14, adaptateur Cloudflare, binding D1 configuré.

---

## Mise en place en 4 étapes

### 1. Configurer les collections

```ts
// cms.config.ts
import { defineConfig, defineFields } from '@geniusofdigital/astro-cms/config'

export default defineConfig({
  collections: {
    posts: {
      label: 'Articles',
      fields: {
        title:   defineFields.text({ label: 'Titre', required: true }),
        content: defineFields.richtext({ label: 'Contenu' }),
        status:  defineFields.select(['draft', 'published'], { label: 'Statut' }),
        image:   defineFields.media({ label: 'Image' }),
      },
    },
  },
})
```

### 2. Ajouter l'intégration Astro

```ts
// astro.config.ts
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import { cms } from '@geniusofdigital/astro-cms/astro'
import cmsConfig from './cms.config'

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [cms(cmsConfig)],
})
```

L'intégration fait automatiquement au démarrage :
- Expose la config via un **virtual module** (`virtual:astro-cms/config`)
- Ajoute un **middleware** qui protège toutes les routes `/admin/*`
- **Injecte les 17 routes admin** — aucun fichier à créer dans votre projet

### 3. Générer les migrations SQL

```bash
npx astro-cms generate
```

Produit dans `migrations/` :
- `0001_cms_system.sql` — tables système (tags, menus, media…)
- `0002_user_collections.sql` — tables pour vos collections
- `cms.d.ts` — types TypeScript générés depuis votre config

Appliquez ensuite avec Wrangler :
```bash
wrangler d1 execute <DB_NAME> --file=migrations/0001_cms_system.sql
wrangler d1 execute <DB_NAME> --file=migrations/0002_user_collections.sql
```

### 4. Variables d'environnement

Dans `wrangler.toml` ou le dashboard Cloudflare :

```toml
[[d1_databases]]
binding = "DB"
database_name = "mon-cms"
database_id = "..."

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "mon-cms-media"

[vars]
ADMIN_PASSWORD = "mon-mot-de-passe-secret"
```

> Sans `ADMIN_PASSWORD`, l'accès admin est libre (pratique en développement local).

---

## Routes admin injectées

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard |
| `/admin/login` | Connexion |
| `/admin/logout` | Déconnexion |
| `/admin/media` | Médiathèque (R2) |
| `/admin/[collection]` | Liste des entrées |
| `/admin/[collection]/new` | Créer une entrée |
| `/admin/[collection]/[id]` | Modifier une entrée |
| `/admin/system/tags` | Gestion des tags |
| `/admin/system/categories` | Gestion des catégories |
| `/admin/system/menu` | Menus de navigation |
| `/admin/system/menu/[id]` | Items d'un menu |
| `/admin/system/sections` | Sections de page |
| `/admin/system/widgets` | Widgets |
| `/admin/system/comments` | Modération des commentaires |
| `/admin/system/content-types` | Types de contenu (lecture) |
| `/admin/system/users` | Utilisateurs |
| `/admin/system/settings` | Paramètres et état des bindings |

---

## API runtime (dans vos pages Astro)

```ts
// src/pages/blog/[slug].astro
import { createCMSClient } from '@geniusofdigital/astro-cms'

const db = Astro.locals.runtime.env.DB
const cms = createCMSClient(db)

const posts = await cms.collections('posts').find({ where: { status: 'published' } })
const post  = await cms.collections('posts').findOne({ slug: Astro.params.slug })
```

### Système (tags, menus, sections…)

```ts
import { createSystemClient } from '@geniusofdigital/astro-cms/system'

const system = createSystemClient(db)

const tags       = await system.tags.list()
const menus      = await system.menu.list()
const categories = await system.categories.list()
const sections   = await system.sections.listByPage('home')
```

---

## Types de champs

| Type | Description | Options |
|------|-------------|---------|
| `text` | Texte simple | `maxLength` |
| `richtext` | Éditeur riche | — |
| `number` | Nombre | `min`, `max` |
| `boolean` | Vrai/Faux | `defaultValue` |
| `date` | Date | — |
| `select` | Liste | options (1er argument) |
| `media` | Fichier R2 | — |
| `relation` | Référence | `collection` |

Chaque collection reçoit automatiquement `id`, `created_at`, `updated_at`.

---

## Schéma système (D1)

```
cms_tags         Tags
cms_categories   Catégories (hiérarchiques)
cms_menus        Menus de navigation
cms_menu_items   Items de menu (hiérarchiques, avec class CSS)
cms_sections     Sections de page
cms_widgets      Widgets
cms_comments     Commentaires (avec modération)
cms_media        Métadonnées des fichiers R2
```

---

## Authentification

Basée sur des **cookies HMAC signés** (Web Crypto API) — fonctionne nativement dans Cloudflare Workers, sans dépendance externe.

- Session de 24h
- Cookie `httpOnly`, `sameSite: lax`, `secure` en production
- Contrôlée par la variable d'environnement `ADMIN_PASSWORD`

---

## Exports du package

| Import | Contenu |
|--------|---------|
| `@geniusofdigital/astro-cms` | `createCMSClient` — client runtime collections |
| `@geniusofdigital/astro-cms/config` | `defineConfig`, `defineFields` |
| `@geniusofdigital/astro-cms/astro` | `cms()` — intégration Astro |
| `@geniusofdigital/astro-cms/api` | Helpers API (collections, menus, taxonomy…) |
| `@geniusofdigital/astro-cms/system` | `createSystemClient` — tags, menus, media… |

---

## Développement du package

```bash
bun run build      # Compile les 3 targets TypeScript
bun run typecheck  # Vérification sans compilation
```

Le package publie `dist/`, `bin/` et `src/admin/` vers npm.
Les fichiers `.astro` sont expédiés en source — Astro les traite dans le projet de l'utilisateur.
