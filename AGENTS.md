# @geniusofdigital/astro-cms - AI Agent Skill

## Overview

This is a headless type-safe CMS for **Astro + Cloudflare** (D1, R2, KV). Provides a complete admin interface without writing SQL manually.

## Package Structure

```
@geniusofdigital/astro-cms/
├── src/
│   ├── astro/           # Astro integration + middleware
│   ├── config/          # Config schema & type definitions
│   ├── runtime/         # CMS client for static collections
│   ├── system/          # System client (menus, tags, categories, etc.)
│   ├── api/            # Public API endpoints
│   ├── cli/             # CLI commands
│   └── admin/           # Admin UI pages (.astro files)
```

## Required Bindings

| Binding | Required | Type | Description |
|----------|----------|------|-------------|
| DB | Yes | D1Database | SQLite database |
| MEDIA | No | R2Bucket | File storage |
| CACHE | No | KVNamespace | Query cache |
| ADMIN_PASSWORD | No | string | Admin auth (empty = open) |

---

# CONNEXION À LA BASE DE DONNÉES

## 1. Static Collections (defined in code)

Import the client in your Astro pages:

```ts
import { createCMSClient, createCachedCMSClient } from '@geniusofdigital/astro-cms'
import { env } from 'cloudflare:workers'
import config from '../cms.config'

const cms = createCMSClient(config, {
  db: env.DB as D1Database,
  media: env.MEDIA as R2Bucket,  // optional
  cache: env.CACHE as KVNamespace, // optional
})

// Or with caching
const cms = createCachedCMSClient(config, {
  db: env.DB as D1Database,
  media: env.MEDIA as R2Bucket,
  cache: env.CACHE as KVNamespace,
  cacheTTL: 300,
})
```

### Collection Client Methods

For each collection defined in `cms.config.ts`, you get these methods:

```ts
// [collection] is the name of your collection (e.g., 'articles', 'products', 'pages')

// FIND - List all records
const articles = await cms.articles.find()                        // returns array
const articles = await cms.articles.find({
  where: { featured: true, category: 'Tech' },       // filter (exact match)
  limit: 10,                                      // default: 100
  offset: 0,                                       // default: 0
  orderBy: { field: 'publishedAt', direction: 'desc' }  // 'asc' or 'desc'
})

// FIND ONE - Get single record by ID
const article = await cms.articles.findOne(42)        // returns object or null

// CREATE - Add new record
const newArticle = await cms.articles.create({
  title: 'My Article',
  body: '<p>Content</p>',
  publishedAt: '2024-01-15',
  featured: true,
  category: 'Tech'
})

// UPDATE - Modify existing record
const updated = await cms.articles.update(42, {
  title: 'Updated Title',
  featured: false
})

// DELETE - Remove record
await cms.articles.delete(42)
```

## 2. Dynamic Collections (created in admin)

For collections created via `/admin/system/content-types`:

```ts
import { createSystemClient, createCachedSystemClient } from '@geniusofdigital/astro-cms/system'
import { env } from 'cloudflare:workers'

// Without cache
const system = createSystemClient(env.DB as D1Database)

// With cache
const system = createCachedSystemClient(
  env.DB as D1Database,
  env.CACHE as KVNamespace  // optional
)
```

### Content Types Methods

```ts
// LIST all content types
const types = await system.contentTypes.list()

// GET single type by ID
const type = await system.contentTypes.get(1)

// GET single type by slug
const type = await system.contentTypes.getBySlug('blog')

// CREATE new content type
const newType = await system.contentTypes.create({
  name: 'Blog Posts',
  slug: 'blog',
  description: 'Blog articles'
})

// DELETE content type
await system.contentTypes.delete(1)

// LIST fields of a content type
const fields = await system.contentTypes.listFields(typeId)

// ADD field to content type
await system.contentTypes.addField(contentTypeId, {
  name: 'title',           // field key (snake_case)
  label: 'Title',         // display label
  type: 'richtext',       // 'text'|'richtext'|'textarea'|'number'|'boolean'|'date'|'select'|'email'|'url'
  required: true,
  placeholder: 'Enter title',
  helpText: 'Main title',
  options: ['Option A', 'Option B'],  // for select type
  order: 0
})

// DELETE field
await system.contentTypes.deleteField(fieldId)
```

### Entries (Dynamic Content) Methods

```ts
// LIST entries
const entries = await system.entries.list(contentTypeId, {
  status: 'published',  // 'draft'|'published' or undefined for all
  limit: 50
})

// GET single entry
const entry = await system.entries.get(1)

// CREATE entry
const newEntry = await system.entries.create(contentTypeId, {
  title: 'My Post',
  body: '<p>Content</p>'
}, 'published')

// UPDATE entry
const updated = await system.entries.update(entryId, {
  title: 'Updated Title'
}, 'published')

// DELETE entry
await system.entries.delete(entryId)
```

---

# TOUTES LES MÉTHODES DU SYSTÈME CLIENT

## Menu Methods

```ts
const menu = system.menu

// List all menus
const menus = await menu.list()

// Get menu with items by slug
const menuWithItems = await menu.get('main')

// Create menu
const newMenu = await menu.create({ name: 'Main', slug: 'main' })

// Add item to menu
const item = await menu.addItem(menuId, {
  label: 'Home',
  url: '/',
  target: '_self',        // '_self' | '_blank'
  className: 'nav-link',
  order: 0,
  parentId: null       // for submenus
})

// Delete menu item
await menu.deleteItem(itemId)

// Delete entire menu
await menu.delete(menuId)
```

## Tags Methods

```ts
const tags = system.tags

// List all tags
const allTags = await tags.list()

// Create tag
const tag = await tags.create({ name: 'Astro', slug: 'astro' })

// Delete tag
await tags.delete(id)
```

## Categories Methods

```ts
const categories = system.categories

// List all categories
const allCategories = await categories.list()

// Create category
const cat = await categories.create({
  name: 'Technology',
  slug: 'technology',
  description: 'Tech news',
  parentId: null     // for subcategories
})

// Delete category
await categories.delete(id)
```

## Sections Methods

```ts
const sections = system.sections

// List sections by page
const sections = await sections.listByPage('home')

// Create section
const section = await sections.create({
  page: 'home',
  type: 'hero',           // 'hero'|'text'|'gallery'|'cta'|'custom'
  title: 'Welcome',
  content: '<p>Hello</p>',
  order: 0,
  settings: { bgColor: '#fff' }  // JSON settings
})

// Update section
const updated = await sections.update(sectionId, {
  title: 'New Title',
  content: '<p>Updated</p>',
  order: 1,
  settings: { bgColor: '#000' }
})

// Delete section
await sections.delete(id)
```

## Widgets Methods

```ts
const widgets = system.widgets

// List widgets by area
const widgetsByArea = await widgets.listByArea('sidebar')

// Create widget
const widget = await widgets.create({
  name: 'Newsletter',
  area: 'sidebar',
  type: 'newsletter',
  content: { buttonText: 'Subscribe' },
  order: 0
})

// Delete widget
await widgets.delete(id)
```

## Comments Methods

```ts
const comments = system.comments

// List all comments
const allComments = await comments.list()

// List with filters
const pendingComments = await comments.list({
  collection: 'articles',
  status: 'pending'
})

// Create comment
const comment = await comments.create({
  collection: 'articles',
  entryId: 42,
  author: 'John Doe',
  email: 'john@example.com',
  content: 'Great article!'
})

// Update comment status
await comments.updateStatus(commentId, 'approved')  // 'pending'|'approved'|'rejected'

// Delete comment
await comments.delete(id)
```

## Forms Methods

```ts
const forms = system.forms

// List all forms
const allForms = await forms.list()

// Get form by ID
const form = await forms.get(1)

// Create form
const newForm = await forms.create({
  name: 'Contact',
  slug: 'contact',
  description: 'Contact form'
})

// Delete form
await forms.delete(id)

// List form fields
const fields = await forms.listFields(formId)

// Add field to form
const field = await forms.addField(formId, {
  label: 'Your Name',
  type: 'text',           // 'text'|'email'|'textarea'|'select'|'checkbox'|'radio'|'number'|'date'|'tel'|'url'
  required: true,
  placeholder: 'John Doe',
  options: ['Option A', 'Option B'],  // for select/radio
  order: 0
})

// Delete field
await forms.deleteField(fieldId)

// List submissions
const submissions = await forms.listSubmissions(formId)
```

## Media Methods (R2 + D1)

```ts
const media = system.mediaDb

// List media entries
const mediaList = await media.list(50, 0)

// Create media entry (for files uploaded to R2)
const entry = await media.create({
  key: 'uploads/image.jpg',
  filename: 'image.jpg',
  contentType: 'image/jpeg',
  size: 12345,
  url: '/media/uploads/image.jpg',
  alt: 'Description'
})

// Delete media entry
await media.delete(id)
```

---

# MEDIA (R2 FILE STORAGE)

```ts
import { createCMSClient } from '@geniusofdigital/astro-cms'
import { env } from 'cloudflare:workers'

const cms = createCMSClient(config, {
  db: env.DB,
  media: env.MEDIA
})

// Upload file
const result = await cms.media.upload(fileInput, {
  key: 'uploads/my-image.jpg',
  contentType: 'image/jpeg',
  metadata: { author: 'John' }
})
// Returns: { key, url, size, contentType, uploadedAt }

// Get public URL
const url = cms.media.getUrl('uploads/my-image.jpg')

// Delete file
await cms.media.delete('uploads/my-image.jpg')

// List files
const files = await cms.media.list('uploads/')
```

---

# CACHE (KV)

```ts
import { createCachedCMSClient } from '@geniusofdigital/astro-cms'

const cms = createCachedCMSClient(config, {
  db: env.DB,
  cache: env.CACHE,
  cacheTTL: 300
})

// Cache is automatic for collections
// Manual cache operations:
await cms.cache.set('mykey', data, 3600)           // set with TTL
const data = await cms.cache.get('mykey')              // get
await cms.cache.invalidate('mykey')                // delete single
await cms.cache.invalidatePattern('prefix:')        // delete by prefix
```

---

# ADMIN ROUTES (auto-injected)

| Route | Description |
|---|---|
| `/admin` | Dashboard |
| `/admin/login` | Login |
| `/admin/logout` | Logout |
| `/admin/media` | Media library |
| `/admin/[collection]` | Entry list (static or dynamic) |
| `/admin/[collection]/new` | Create entry |
| `/admin/[collection]/[id]` | Edit entry |
| `/admin/system/tags` | Tags |
| `/admin/system/categories` | Categories |
| `/admin/system/menu` | Menus |
| `/admin/system/sections` | Sections |
| `/admin/system/widgets` | Widgets |
| `/admin/system/comments` | Comments |
| `/admin/system/forms` | Forms |
| `/admin/system/content-types` | Content types |
| `/admin/system/content-types/[id]` | Field management |

---

# ERROR HANDLING

```ts
try {
  await cms.articles.create({ title: 'Test' })
} catch (e: any) {
  // D1 errors: e.message contains SQLite error
  console.error(e.message)
}
```

---

# TYPESCRIPT TYPES

```ts
import type { InferCollectionRecord } from '@geniusofdigital/astro-cms/config'
import config from './cms.config'

type Article = InferCollectionRecord<typeof config.collections.articles>
// { id: number; title: string; body: string; ... }
```