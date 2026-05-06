# Configuration & Schema Instructions

This directory defines how users configure their CMS collections in code.

## Configuration Schema
- `schema.ts`: Defines the Zod schema (`cmsConfigSchema`) used to validate the project's configuration.
- It uses a `discriminatedUnion` for field types.

## Define Helpers
- `define.ts`: Provides `defineConfig`, `defineCollections`, and `defineFields` helpers.
- These helpers provide IDE autocompletion and type checking for users.

## Adding a New Static Field Type
1. **Schema**: Add the new field type to the `discriminatedUnion` in `src/config/schema.ts`.
2. **Types**: Update the corresponding interfaces in `src/config/types.ts`.
3. **Helper**: Add a new method to the `defineFields` object in `src/config/define.ts`.
4. **Admin UI**: Update `src/admin/entry-form.astro` to render the new field correctly.

## Validation
- The `validateConfig` function in `schema.ts` is the entry point for validating the user's config at runtime.
