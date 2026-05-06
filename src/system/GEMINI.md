# System Logic & Database Instructions

This directory handles the core system logic, specifically for dynamic content and system-level entities (menus, forms, etc.).

## Database Schema
- `schemas.ts`: Contains the `SYSTEM_SCHEMA_SQL` which defines the D1 database structure.
- If you modify the database schema, you MUST update this file and potentially provide a migration strategy for existing users.

## System Client
- `client.ts`: The main client for interacting with the system tables.
- It uses standard SQL queries (via Cloudflare D1) to manage entries, content types, and fields.

## Field Types for Dynamic Content
Supported types are: `text`, `richtext`, `textarea`, `number`, `boolean`, `date`, `select`, `email`, `url`.
If adding a new dynamic field type:
1. Update the `CHECK` constraint in `cms_content_type_fields` within `schemas.ts`.
2. Update `ContentTypeFieldType` type definitions in `types.ts`.
3. Update the UI in `src/admin/system/content-types/[id].astro`.
4. Update the rendering logic in `src/admin/entry-form.astro`.

## Caching
- Uses `createCachedSystemClient` to wrap the base system client with KV caching for performance.
- Ensure that updates (create/update/delete) correctly invalidate or update the cache.
