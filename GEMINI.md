# Astro CMS Project Instructions

This project is a type-safe CMS runtime for Astro + Cloudflare (D1, R2, KV). It allows users to define content collections and manage them through an admin interface.

## Architecture Overview

- **Frontend**: Astro components for the admin UI (`src/admin`).
- **State/Logic**: Runtime logic in `src/runtime`.
- **Configuration**: Type-safe configuration using Zod and custom define functions (`src/config`).
- **Backend**: Cloudflare D1 (SQL Database), KV (Caching), and R2 (Media Storage).
- **Rich Text**: React-based Tiptap editor in `src/admin/components/RichTextEditor.tsx`.

## Core Conventions

- **Type Safety**: Always prioritize type safety. Use Zod schemas for validation and TypeScript for all interfaces.
- **Astro & React**: Use Astro components for server-side rendering and layouts. Use React components ONLY when client-side interactivity is required (e.g., Rich Text Editor).
- **CSS**: Prefer scoped styles within Astro components or global variables in `layout.astro`.
- **Naming**: 
  - Collections: Singular or plural, but consistent.
  - Fields: camelCase.

## Common Tasks

### 1. Modifying CMS Configuration
Configuration is defined using `defineConfig` in the user's project (not necessarily in this repo, but this repo defines the helpers).
- Schema: `src/config/schema.ts`
- Helpers: `src/config/define.ts`

To add a new field type:
1. Update `fieldSchema` in `src/config/schema.ts`.
2. Add a helper function in `defineFields` in `src/config/define.ts`.
3. Update `src/config/types.ts` to include the new field type.
4. Update `src/admin/entry-form.astro` to handle the rendering of the new field.

### 2. Customizing the Admin UI
The admin UI is located in `src/admin`.
- `layout.astro`: Main layout with sidebar and styles.
- `collection.astro`: List view for entries.
- `entry-form.astro`: Create/Edit view.
- `media.astro`: Media library.

### 3. Modifying Runtime Logic
- `src/runtime/collections.ts`: Handles data fetching and manipulation for static collections.
- `src/system/client.ts`: Handles logic for dynamic content types and entries.

## Cloudflare Specifics
- Uses `cloudflare:workers` for environment variables.
- `DB` (D1Database), `CACHE` (KVNamespace), `STORAGE` (R2Bucket) are expected in the environment.

## AI Workflow
When modifying the CMS:
1. **Research** the relevant files (Config vs Admin vs Runtime).
2. **Strategy**: Explain how the change impacts the whole flow (from config to DB to UI).
3. **Execution**: Apply changes surgically.
4. **Validation**: Since this is a library/runtime, ensure types are correctly exported and compatible.
