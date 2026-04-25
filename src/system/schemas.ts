export const SYSTEM_SCHEMA_SQL = `
-- Menus
CREATE TABLE IF NOT EXISTS cms_menus (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_menu_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_id     INTEGER NOT NULL REFERENCES cms_menus(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  url         TEXT NOT NULL,
  target      TEXT CHECK(target IN ('_self', '_blank')) DEFAULT '_self',
  class_name  TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  parent_id   INTEGER REFERENCES cms_menu_items(id) ON DELETE SET NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- Tags
CREATE TABLE IF NOT EXISTS cms_tags (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Categories
CREATE TABLE IF NOT EXISTS cms_categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id   INTEGER REFERENCES cms_categories(id) ON DELETE SET NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- Sections
CREATE TABLE IF NOT EXISTS cms_sections (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK(type IN ('hero', 'text', 'gallery', 'cta', 'custom')),
  title      TEXT,
  content    TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  settings   TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Widgets
CREATE TABLE IF NOT EXISTS cms_widgets (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  area       TEXT NOT NULL,
  type       TEXT NOT NULL,
  content    TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Comments
CREATE TABLE IF NOT EXISTS cms_comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  collection TEXT NOT NULL,
  entry_id   INTEGER NOT NULL,
  author     TEXT NOT NULL,
  email      TEXT NOT NULL,
  content    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Media metadata (R2 keys + metadata in D1)
CREATE TABLE IF NOT EXISTS cms_media (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  key          TEXT NOT NULL UNIQUE,
  filename     TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size         INTEGER NOT NULL,
  url          TEXT NOT NULL,
  alt          TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);
`.trim()
