# @geniusofdigital/astro-cms

CMS headless type-safe pour **Astro + Cloudflare** (D1 · R2 · KV).  
Interface d'administration complète, sans base de données SQL à écrire à la main.

---

## Table des matières

- [Installation](#installation)
- [Configuration rapide](#configuration-rapide)
- [CLI](#cli)
- [Intégration Astro](#intégration-astro)
- [Collections statiques](#collections-statiques)
- [Collections dynamiques (Content Types)](#collections-dynamiques-content-types)
- [Client runtime](#client-runtime)
- [Client système](#client-système)
- [Médias](#médias)
- [Cache](#cache)
- [Interface d'administration](#interface-dadministration)
- [Authentification](#authentification)
- [Variables d'environnement](#variables-denvironnement)
- [Tables SQL](#tables-sql-générées)

---

## Installation

```bash
npm install @geniusofdigital/astro-cms
```

**Pré-requis :** Astro ≥ 4.14, Node ≥ 18, projet Cloudflare Workers (D1 + R2 + KV).

---

## Configuration rapide

### 1. Créer `cms.config.ts`

```bash
bunx astro-cms init
```

Ou à la main :

```ts
// cms.config.ts
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
      },
    }),
  },
})
```

### 2. Générer les migrations SQL

```bash
bunx astro-cms generate
wrangler d1 migrations apply <DATABASE_NAME> --local
```

### 3. Ajouter l'intégration dans `astro.config.ts`

```ts
import { defineConfig } from 'astro/config'
import { cms } from '@geniusofdigital/astro-cms/astro'
import config from './cms.config'

export default defineConfig({
  output: 'server',
  integrations: [cms(config)],
})
```

---

## CLI

| Commande | Description |
|---|---|
| `astro-cms init` | Crée un fichier `cms.config.ts` de démarrage |
| `astro-cms generate` | Génère les migrations SQL D1 depuis la config |
| `astro-cms validate` | Valide la config et les bindings `wrangler.toml` |

Le CLI lit automatiquement `wrangler.jsonc`, `wrangler.json` ou `wrangler.toml` (par ordre de priorité).  
Le fichier de config peut être `.ts`, `.js` ou `.mjs` (transpilé via `jiti`).

---

## Intégration Astro

```ts
import { cms } from '@geniusofdigital/astro-cms/astro'

cms(config) // retourne un AstroIntegration
```

L'intégration :
- Injecte toutes les routes `/admin/*` en SSR (`prerender: false`)
- Ajoute le middleware d'authentification (ordre `pre`)
- Expose le module virtuel `virtual:astro-cms/config` aux pages admin

---

## Collections statiques

Définies dans `cms.config.ts`. Requièrent une migration SQL (`astro-cms generate`) après chaque modification.

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

## Collections dynamiques (Content Types)

Créées directement dans l'admin sans toucher au code ni relancer de migration.  
Accessible via `/admin/system/content-types`.

### Fonctionnement

1. Créer un type (nom + slug + description optionnelle)
2. Ajouter des champs via l'interface
3. Le type apparaît automatiquement dans la barre de navigation sous **Contenu**
4. Les entrées sont saisies via `/admin/[slug]` — identique aux collections statiques

### Types de champs disponibles dans l'admin

| Type | Description |
|---|---|
| `text` | Texte court (input) |
| `richtext` | Texte riche (grande textarea) |
| `textarea` | Texte long |
| `number` | Nombre |
| `boolean` | Case à cocher Oui/Non |
| `date` | Sélecteur de date |
| `select` | Liste déroulante (options à définir) |
| `email` | Champ email |
| `url` | Champ URL |

Chaque champ possède : **clé** (identifiant snake_case), **label**, **type**, **placeholder**, **texte d'aide**, **obligatoire**, **options** (pour select).

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

Pour interagir avec les **collections statiques** depuis les pages Astro ou les API routes.

```ts
import { createCMSClient } from '@geniusofdigital/astro-cms'
import { env } from 'cloudflare:workers'
import config from '../cms.config'

const cms = createCMSClient(config, {
  db:    env.DB,      // D1Database — requis
  media: env.MEDIA,   // R2Bucket  — optionnel
  cache: env.CACHE,   // KVNamespace — optionnel
})
```

### Méthodes disponibles par collection

```ts
// Lister avec filtres
await cms.articles.find()
await cms.articles.find({
  where:   { featured: true },
  limit:   10,
  offset:  0,
  orderBy: { field: 'publishedAt', direction: 'desc' },
})

// Lire un seul
await cms.articles.findOne(42)         // Article | null

// Créer
await cms.articles.create({
  title: 'Mon article',
  body:  '<p>Contenu</p>',
})

// Modifier
await cms.articles.update(42, { title: 'Nouveau titre' })

// Supprimer
await cms.articles.delete(42)
```

### Options de `find()`

```ts
interface FindOptions {
  where?:   Record<string, string | number | boolean | null>
  limit?:   number
  offset?:  number
  orderBy?: { field: string; direction?: 'asc' | 'desc' }
}
```

---

## Client système

Pour les entités système (menus, tags, catégories, etc.).

```ts
import { createSystemClient } from '@geniusofdigital/astro-cms/system'
const system = createSystemClient(env.DB)
```

### Menus

```ts
system.menu.list()
system.menu.get('principal')                    // MenuWithItems | null
system.menu.create({ name: 'Principal', slug: 'principal' })
system.menu.addItem(menuId, {
  label: 'Accueil', url: '/', target: '_self',
  order: 0, parentId: null,
})
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
  type:     'hero',      // 'hero' | 'text' | 'gallery' | 'cta' | 'custom'
  title?:   'Bienvenue',
  content?: '<p>...</p>',
  order?:   0,
  settings?: { bgColor: '#fff' },   // JSON libre
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
  type:         'text',      // 'text'|'email'|'textarea'|'select'|'checkbox'|'radio'|'number'|'date'|'tel'|'url'
  required?:    true,
  placeholder?: 'Jean Dupont',
  options?:     ['Option A', 'Option B'],   // pour select, radio, checkbox
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
  name:        'titre',     // clé technique snake_case
  label:       'Titre',
  type:        'text',      // 'text'|'richtext'|'textarea'|'number'|'boolean'|'date'|'select'|'email'|'url'
  required?:   true,
  placeholder?: 'Mon projet',
  helpText?:   'Titre principal affiché sur le site',
  options?:    ['Option A', 'Option B'],
  order?:      0,
})
system.contentTypes.deleteField(fieldId)

// Entrées JSON
system.entries.list(contentTypeId, { status?: 'draft'|'published', limit?: 50 })
system.entries.get(id)
system.entries.create(contentTypeId, { titre: 'Mon projet', description: '...' }, 'published')
system.entries.update(id, { titre: 'Modifié' }, 'published')
system.entries.delete(id)
```

---

## Médias

Stockage dans **Cloudflare R2**, métadonnées dans D1.

```ts
import { createMediaClient } from '@geniusofdigital/astro-cms'

const media = createMediaClient({
  bucket:    env.MEDIA,
  publicUrl: 'https://cdn.monsite.com',
})

// Upload
const obj = await media.upload(file, {
  key?:         'images/photo.jpg',   // généré auto si omis
  contentType?: 'image/jpeg',
  metadata?:    { author: 'Jean' },
})
// { key, url, size, contentType, uploadedAt }

// URL publique depuis une clé
const url = media.getUrl('images/photo.jpg')

// Supprimer
await media.delete('images/photo.jpg')

// Lister
const files = await media.list('images/')
```

---

## Cache

Couche KV optionnelle pour mettre en cache les résultats de requêtes.

```ts
const cms = createCMSClient(config, { db: env.DB, cache: env.CACHE })

await cms.cache.set('articles:home', data, 3600)     // TTL en secondes
const data = await cms.cache.get<Article[]>('articles:home')
await cms.cache.invalidate('articles:home')
await cms.cache.invalidatePattern('articles:')        // invalide tout le préfixe
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
| `/admin/[collection]` | Liste des entrées (statique ou dynamique) |
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

Le middleware protège toutes les routes `/admin/*` sauf login et logout.

- **`ADMIN_PASSWORD` non défini** → accès libre (développement local)
- **`ADMIN_PASSWORD` défini** → connexion requise, cookie HMAC-SHA256 signé, TTL 24h

```toml
# wrangler.toml
[vars]
ADMIN_PASSWORD = "mon-mot-de-passe-secret"
```

---

## Variables d'environnement

| Variable | Requis | Description |
|---|---|---|
| `DB` | Oui | Binding D1 (base de données SQLite Cloudflare) |
| `MEDIA` | Non | Binding R2 (stockage fichiers) |
| `CACHE` | Non | Binding KV (cache lectures) |
| `ADMIN_PASSWORD` | Non | Mot de passe admin (vide = accès libre) |

### `wrangler.toml` minimal

```toml
name = "mon-site"
compatibility_date = "2024-09-23"

[[d1_databases]]
binding      = "DB"
database_name = "mon-cms"
database_id  = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

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
Les tables système sont disponibles via :

```ts
import { SYSTEM_SCHEMA_SQL } from '@geniusofdigital/astro-cms/system'
// Passer ce SQL à D1 lors du setup initial
```

| Table | Description |
|---|---|
| `cms_menus` | Menus de navigation |
| `cms_menu_items` | Éléments de menu (hiérarchiques) |
| `cms_tags` | Tags |
| `cms_categories` | Catégories (support parent) |
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
