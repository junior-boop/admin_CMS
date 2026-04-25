import type {
  CMSConfig,
  CollectionDefinition,
  Field,
  TextField,
  RichtextField,
  NumberField,
  BooleanField,
  DateField,
  SelectField,
  MediaField,
  RelationField,
} from './types.js'

// ─── defineConfig ─────────────────────────────────────────────────────────────

export function defineConfig<T extends Record<string, CollectionDefinition>>(
  config: CMSConfig<T>
): CMSConfig<T> {
  return config
}

// ─── defineCollections ────────────────────────────────────────────────────────

export function defineCollections<T extends Record<string, Field>>(
  definition: CollectionDefinition<T>
): CollectionDefinition<T> {
  return definition
}

// ─── defineFields ─────────────────────────────────────────────────────────────

export const defineFields = {
  text(options: Omit<TextField, 'type'> = {}): TextField {
    return { type: 'text', ...options }
  },

  richtext(options: Omit<RichtextField, 'type'> = {}): RichtextField {
    return { type: 'richtext', ...options }
  },

  number(options: Omit<NumberField, 'type'> = {}): NumberField {
    return { type: 'number', ...options }
  },

  boolean(options: Omit<BooleanField, 'type'> = {}): BooleanField {
    return { type: 'boolean', ...options }
  },

  date(options: Omit<DateField, 'type'> = {}): DateField {
    return { type: 'date', ...options }
  },

  select<const TOptions extends readonly string[]>(
    options: readonly TOptions[number][] | TOptions,
    rest: Omit<SelectField, 'type' | 'options'> = {}
  ): SelectField {
    return { type: 'select', options: options as readonly string[], ...rest }
  },

  media(options: Omit<MediaField, 'type'> = {}): MediaField {
    return { type: 'media', ...options }
  },

  relation(collection: string, options: Omit<RelationField, 'type' | 'collection'> = {}): RelationField {
    return { type: 'relation', collection, ...options }
  },
} satisfies Record<string, (...args: never[]) => Field>
