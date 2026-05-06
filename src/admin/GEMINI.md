# Admin UI Instructions

This directory contains the Astro components for the CMS Admin interface.

## Layout & Styles
- `layout.astro`: The master layout. It includes the sidebar and global CSS variables.
- Styles are primarily scoped within Astro components using `<style>` tags.
- Use the CSS variables defined in `layout.astro` for consistent colors and spacing.

## Form Handling
- `entry-form.astro`: The central component for creating/editing entries.
  - It distinguishes between `isStatic` (pre-defined in code) and dynamic (stored in DB).
  - When adding a new field type, you must update both the Static rendering logic and the Dynamic rendering logic in this file.
  - Handles POST requests for saving data.

## System Pages
Located in `src/admin/system/`:
- `content-types/`: Management of dynamic content types and their fields.
- `forms/`: Management of custom forms and submissions.
- `menu/`: Navigation menu builder.

## Rich Text Editor
- `components/RichTextEditor.tsx`: A React component using Tiptap.
- Use `client:only="react"` when importing it into Astro files.
- Styles for the editor are partially in the component and partially in `entry-form.astro`.

## Navigation
- Sidebar navigation is built in `layout.astro`.
- Static collections are pulled from the config.
- Dynamic content types are pulled from the system client.
