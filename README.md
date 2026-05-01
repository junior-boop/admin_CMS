# @geniusofdigital/astro-cms

CMS headless type-safe pour **Astro + Cloudflare** (D1 · R2 · KV).  
Interface d'administration complète, sans SQL à écrire à la main.

---

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Démarrage d'un nouveau projet](#démarrage-dun-nouveau-projet)
- [Configuration `cms.config.ts`](#configuration-cmsconfigts)
- [CLI](#cli)
- [Intégration Astro](#intégration-astro)
- [Collections statiques](#collections-statiques)
- [Collections dynamiques](#collections-dynamiques)
- [Client runtime](#client-runtime)
- [Client système](#client-système)
- [Médias](#médias)
- [Cache](#cache)
- [Interface d'administration](#interface-dadministration)
- [Authentification](#authentification)
- [Variables d'environnement](#variables-denvironnement)
- [Tables SQL générées](#tables-sql-générées)

---

## Prérequis

- Astro ≥ 4.14
- Node ≥ 18 (ou Bun)
- Projet Cloudflare Workers avec D1 (requis), R2 et KV (optionnels)

---

## Installation

```bash
bun add @geniusofdigital/astro-cms
# ou
npm install @geniusofdigital/astro-cms
```

---

## Démarrage d'un nouveau projet

Toutes les collections peuvent être créées depuis l'interface admin, sans définir de schéma en code.

### 1. Créer `cms.config.ts`

```ts
import { defineConfig } from '@geniusofdigital/astro-cms/config'

export default defineConfig({
  collections: {} // tout se gère depuis l'admin
})
```

### 2. Ajouter l'intégration dans `astro.config.ts`

```ts
import { defineConfig } from 'astro/config'
import { cms } from '@geniusofdigital/astro-cms/astro'
import cmsConfig from './cms.config'

export default defineConfig({
  output: 'server',
  integrations: [cms(cmsConfig)],
})
```

> **Note JSX** — L'intégration ajoute React en interne pour les composants admin. Si ton projet utilise déjà React, tu verras un avertissement `More than one JSX renderer`. Pour le supprimer, retire `react()` de tes propres intégrations et laisse le CMS le gérer automatiquement.

### 3. Générer les migrations SQL

```bash
bunx astro-cms generate
```

Avec `collections: {}`, seul le fichier système (`0001_cms_system.sql`) est généré.

### 4. Appliquer les migrations

```bash
# En local
npx wrangler d1 migrations apply <NOM_DB> --local

# En production
npx wrangler d1 migrations apply <NOM_DB> --remote
```

> Ces étapes se font **une seule fois** à la création du projet, ou après une mise à jour du package qui ajoute de nouvelles tables.

### 5. Lancer le serveur de développement

```bash
bun run dev
```

### 6. Créer tes collections depuis l'admin

Rends-toi sur `/admin/system/content-types` pour créer tes types de contenu, définir leurs champs, puis gérer les entrées depuis `/admin/[slug]`.

---

## Configuration `cms.config.ts`

### Collections avec schéma

```ts
import { defineConfig, defineCollections, defineFields } from '@geniusofdigital/astro-cms/config'

export default defineConfig({
  collections: {
    articles: defineCollections({
      label: 'Articles',
      fields: {
        title:       defineFields.text({ required: true, label: 'Titre' }),
        body:        defineFields.richtext({ label: 'Contenu' }),
        publishedAt: defineFields.date({ label: 'Date de publication' }),
        featured:    defineFields.boolean({ label: 'En vedette' }),
        category:    defineFields.select(['Actualité', 'Tutoriel', 'Avis'], { label: 'Catégorie' }),
        cover:       defineFields.media({ label: 'Image de couverture' }),
        authorId:    defineFields.relation('authors', { label: 'Auteur' }),
      },
    }),
  },
})
```

### Types de champs

| Méthode | Type TypeScript | Options spécifiques |
|---|---|---|
| `defineFields.text()` | `string` | `maxLength?: number` |
| `defineFields.richtext()` | `string` | — |
| `defineFields.number()` | `number` | `min?: number`, `max?: number` |
| `defineFields.boolean()` | `boolean` | `defaultValue?: boolean` |
| `defineFields.date()` | `string` | — |
| `defineFields.select(options[])` | `string` | `options: string[]` (requis) |
| `defineFields.media()` | `{ key: string; url: string }` | — |
| `defineFields.relation(collection)` | `number` | `collection: string` (requis) |

Toutes les méthodes acceptent `required?: boolean` et `label?: string`.

### Inférence de types

```ts
import type { InferCollectionRecord } from '@geniusofdigital/astro-cms/config'
import config from './cms.config'

type Article = InferCollectionRecord<typeof config.collections.articles>
// { id: number; title: string; body: string; publishedAt: string; featured: boolean; ... }
```

---

## CLI

| Commande | Description |
|---|---|
| `astro-cms init` | Crée un fichier `cms.config.ts` de démarrage |
| `astro-cms generate` | Génère les migrations SQL D1 depuis la config |
| `astro-cms validate` | Valide la config et les bindings `wrangler.toml` |

Le CLI lit automatiquement `wrangler.jsonc`, `wrangler.json` ou `wrangler.toml` (par ordre de priorité).  
Le fichier de config supporte `.ts`, `.js` et `.mjs` (transpilé via `jiti`).

---

## Intégration Astro

```ts
import { cms } from '@geniusofdigital/astro-cms/astro'

// dans astro.config.ts
integrations: [cms(config)]
```

Ce que fait l'intégration :
- Injecte toutes les routes `/admin/*` en mode SSR
- Ajoute le middleware d'authentification
- Expose `virtual:astro-cms/config` aux pages admin
- Ajoute React en interne pour les composants admin

---

## Collections statiques

Définies dans `cms.config.ts`. Chaque modification de schéma nécessite une nouvelle migration (`astro-cms generate` + apply).

### API CRUD

```ts
import { createCMSClient } from '@geniusofdigital/astro-cms'
import { env } from 'cloudflare:workers'
import config from '../cms.config'

const cms = createCMSClient(config, {
  db:    env.DB,
  media: env.MEDIA,   // optionnel
  cache: env.CACHE,   // optionnel
})

// Lister
await cms.articles.find()
await cms.articles.find({
  where:   { featured: true },
  limit:   10,
  offset:  0,
  orderBy: { field: 'publishedAt', direction: 'desc' },
})

// Lire un seul
await cms.articles.findOne(42)   // Article | null

// Créer
await cms.articles.create({ title: 'Mon article', body: '<p>...</p>' })

// Modifier
await cms.articles.update(42, { title: 'Nouveau titre' })

// Supprimer
await cms.articles.delete(42)
```

### Client avec cache KV

```ts
import { createCachedCMSClient } from '@geniusofdigital/astro-cms'

const cms = createCachedCMSClient(config, {
  db:       env.DB,
  cache:    env.CACHE,
  cacheTTL: 300,   // TTL en secondes (défaut : 300)
})
```

### Options de `find()`

```ts
interface FindOptions {
  where?:   Record<string, string | number | boolean | null>
  limit?:   number   // défaut : 100
  offset?:  number   // défaut : 0
  orderBy?: { field: string; direction?: 'asc' | 'desc' }
}
```

---

## Collections dynamiques

Créées directement depuis l'admin, sans toucher au code ni relancer de migration.

### Créer un type de contenu

1. Aller sur `/admin/system/content-types`
2. Créer un type (nom + slug + description optionnelle)
3. Ajouter des champs via l'interface
4. Le type apparaît dans la navigation sous **Contenu**
5. Les entrées se gèrent depuis `/admin/[slug]`

### Types de champs disponibles dans l'admin

| Type | Description |
|---|---|
| `text` | Texte court |
| `richtext` | Texte riche (éditeur TipTap) |
| `textarea` | Texte long |
| `number` | Nombre |
| `boolean` | Case à cocher Oui/Non |
| `date` | Sélecteur de date |
| `select` | Liste déroulante (options à définir) |
| `email` | Champ email |
| `url` | Champ URL |

Chaque champ possède : **clé** (snake_case), **label**, **type**, **placeholder**, **texte d'aide**, **obligatoire**, **options** (pour select).

Les entrées ont un statut **brouillon** ou **publié** et sont stockées en JSON dans `cms_entries`.

### Lecture côté frontend

```ts
import { createSystemClient } from '@geniusofdigital/astro-cms/system'
import { env } from 'cloudflare:workers'

const system = createSystemClient(env.DB)

const type    = await system.contentTypes.getBySlug('projets')
const entries = await system.entries.list(type.id, { status: 'published', limit: 10 })
const items   = entries.map(e => JSON.parse(e.data) as { titre: string; description: string })
```

---

## Client runtime

Deux variantes disponibles selon l'usage :

| Fonction | Usage |
|---|---|
| `createCMSClient` | Sans cache — lecture directe D1 |
| `createCachedCMSClient` | Avec cache KV — recommandé en production |

```ts
import { createCMSClient, createCachedCMSClient } from '@geniusofdigital/astro-cms'
```

---

## Client système

Pour interagir avec les entités système (menus, tags, catégories, sections, widgets, commentaires, formulaires, types de contenu).

```ts
import { createSystemClient, createCachedSystemClient } from '@geniusofdigital/astro-cms/system'

// Sans cache
const system = createSystemClient(env.DB)

// Avec cache KV (recommandé en production)
const system = createCachedSystemClient(env.DB, env.CACHE)
```

### Menus

```ts
system.menu.list()
system.menu.get('principal')
system.menu.create({ name: 'Principal', slug: 'principal' })
system.menu.addItem(menuId, { label: 'Accueil', url: '/', target: '_self', order: 0, parentId: null })
system.menu.deleteItem(itemId)
system.menu.delete(menuId)
```

### Tags

```ts
system.tags.list()
system.tags.create({ name: 'Astro', slug: 'astro' })
system.tags.delete(id)
```

### Catégories (hiérarchiques)

```ts
system.categories.list()
system.categories.create({ name: 'Tech', slug: 'tech', description?, parentId? })
system.categories.delete(id)
```

### Sections de page

```ts
system.sections.listByPage('accueil')
system.sections.create({
  page:     'accueil',
  type:     'hero',   // 'hero' | 'text' | 'gallery' | 'cta' | 'custom'
  title?:   'Bienvenue',
  content?: '<p>...</p>',
  order?:   0,
  settings?: { bgColor: '#fff' },
})
system.sections.update(id, { title, content, order, settings })
system.sections.delete(id)
```

### Widgets

```ts
system.widgets.listByArea('sidebar')
system.widgets.create({ name: 'Newsletter', area: 'sidebar', type: 'newsletter', content?, order? })
system.widgets.delete(id)
```

### Commentaires

```ts
system.comments.list()
system.comments.list({ collection: 'articles', status: 'pending' })
system.comments.create({ collection: 'articles', entryId: 42, author: 'Jean', email: 'j@x.fr', content: '...' })
system.comments.updateStatus(id, 'approved')   // 'pending' | 'approved' | 'rejected'
system.comments.delete(id)
```

### Formulaires

```ts
// CRUD formulaire
system.forms.list()
system.forms.get(id)
system.forms.create({ name: 'Contact', slug: 'contact', description? })
system.forms.delete(id)

// Champs
system.forms.listFields(formId)
system.forms.addField(formId, {
  label:        'Votre nom',
  type:         'text',   // 'text'|'email'|'textarea'|'select'|'checkbox'|'radio'|'number'|'date'|'tel'|'url'
  required?:    true,
  placeholder?: 'Jean Dupont',
  options?:     ['Option A', 'Option B'],
  order?:       0,
})
system.forms.deleteField(fieldId)

// Soumissions
system.forms.listSubmissions(formId)   // FormSubmission[] — data en JSON
```

### Content Types (dynamiques)

```ts
// Types
system.contentTypes.list()
system.contentTypes.get(id)
system.contentTypes.getBySlug('projets')
system.contentTypes.create({ name: 'Projets', slug: 'projets', description? })
system.contentTypes.delete(id)

// Champs
system.contentTypes.listFields(contentTypeId)
system.contentTypes.addField(contentTypeId, {
  name:         'titre',
  label:        'Titre',
  type:         'text',   // 'text'|'richtext'|'textarea'|'number'|'boolean'|'date'|'select'|'email'|'url'
  required?:    true,
  placeholder?: 'Mon projet',
  helpText?:    'Titre principal affiché sur le site',
  options?:     ['Option A', 'Option B'],
  order?:       0,
})
system.contentTypes.deleteField(fieldId)

// Entrées JSON
system.entries.list(contentTypeId, { status?: 'draft' | 'published', limit?: 50 })
system.entries.get(id)
system.entries.create(contentTypeId, { titre: 'Mon projet' }, 'published')
system.entries.update(id, { titre: 'Modifié' }, 'published')
system.entries.delete(id)
```

---

## Médias

Stockage dans **Cloudflare R2**, métadonnées dans D1.

```ts
// cms.media est disponible sur le client CMS
const cms = createCMSClient(config, { db: env.DB, media: env.MEDIA })

// Upload
await cms.media.upload(file, {
  key?:         'images/photo.jpg',   // généré automatiquement si omis
  contentType?: 'image/jpeg',
  metadata?:    { author: 'Jean' },
})
// → { key, url, size, contentType, uploadedAt }

// URL publique depuis une clé
cms.media.getUrl('images/photo.jpg')

// Supprimer
await cms.media.delete('images/photo.jpg')

// Lister
await cms.media.list('images/')
```

---

## Cache

Couche KV optionnelle pour mettre en cache les résultats de requêtes.

```ts
const cms = createCMSClient(config, { db: env.DB, cache: env.CACHE })

await cms.cache.set('articles:home', data, 3600)         // TTL en secondes
const data = await cms.cache.get<Article[]>('articles:home')
await cms.cache.invalidate('articles:home')
await cms.cache.invalidatePattern('articles:')            // invalide tout le préfixe
```

---

## Interface d'administration

Routes injectées automatiquement par l'intégration :

| Route | Description |
|---|---|
| `/admin` | Tableau de bord |
| `/admin/login` | Connexion |
| `/admin/logout` | Déconnexion |
| `/admin/media` | Gestionnaire de médias |
| `/admin/[collection]` | Liste des entrées |
| `/admin/[collection]/new` | Nouvelle entrée |
| `/admin/[collection]/[id]` | Modifier une entrée |
| `/admin/system/tags` | Tags |
| `/admin/system/categories` | Catégories |
| `/admin/system/menu` | Menus |
| `/admin/system/menu/[id]` | Éditeur de menu |
| `/admin/system/sections` | Sections de page |
| `/admin/system/widgets` | Widgets |
| `/admin/system/comments` | Modération des commentaires |
| `/admin/system/forms` | Formulaires |
| `/admin/system/forms/[id]` | Constructeur de formulaire |
| `/admin/system/content-types` | Types de contenu dynamiques |
| `/admin/system/content-types/[id]` | Gestion des champs d'un type |
| `/admin/system/users` | Utilisateurs |
| `/admin/system/settings` | Paramètres |

---

## Authentification

Le middleware protège toutes les routes `/admin/*` sauf `/admin/login` et `/admin/logout`.

| Comportement | Condition |
|---|---|
| Accès libre | `ADMIN_PASSWORD` non défini (développement local) |
| Connexion requise | `ADMIN_PASSWORD` défini — cookie HMAC-SHA256 signé, TTL 24h |

```toml
# wrangler.toml
[vars]
ADMIN_PASSWORD = "mon-mot-de-passe-secret"
```

---

## Variables d'environnement

| Variable | Requis | Description |
|---|---|---|
| `DB` | Oui | Binding D1 — base de données SQLite Cloudflare |
| `MEDIA` | Non | Binding R2 — stockage de fichiers |
| `CACHE` | Non | Binding KV — cache des lectures |
| `ADMIN_PASSWORD` | Non | Mot de passe admin (vide = accès libre) |

### `wrangler.toml` minimal

```toml
name = "mon-site"
compatibility_date = "2024-09-23"

[[d1_databases]]
binding       = "DB"
database_name = "mon-cms"
database_id   = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[r2_buckets]]
binding     = "MEDIA"
bucket_name = "mon-cms-media"

[[kv_namespaces]]
binding = "CACHE"
id      = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## Tables SQL générées

Le CLI génère les migrations pour les **collections statiques**.  
Les tables système sont créées via la migration `0001_cms_system.sql` générée automatiquement.

| Table | Description |
|---|---|
| `cms_menus` | Menus de navigation |
| `cms_menu_items` | Éléments de menu (hiérarchiques) |
| `cms_tags` | Tags |
| `cms_categories` | Catégories avec support parent |
| `cms_sections` | Sections de page avec type et settings JSON |
| `cms_widgets` | Widgets par zone |
| `cms_comments` | Commentaires avec statut de modération |
| `cms_forms` | Formulaires |
| `cms_form_fields` | Champs de formulaire |
| `cms_form_submissions` | Soumissions (données en JSON) |
| `cms_content_types` | Types de contenu dynamiques |
| `cms_content_type_fields` | Champs des types dynamiques |
| `cms_entries` | Entrées dynamiques (JSON + statut) |
| `cms_media` | Métadonnées R2 (clé, URL, taille, alt) |

---

## Licence

MIT — [Genius of Digital](https://geniusofdigital.com)
