// ─── Field definitions ────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'media'
  | 'relation'

interface BaseField {
  type: FieldType
  required?: boolean
  label?: string
}

export interface TextField extends BaseField {
  type: 'text'
  maxLength?: number
}

export interface RichtextField extends BaseField {
  type: 'richtext'
}

export interface NumberField extends BaseField {
  type: 'number'
  min?: number
  max?: number
}

export interface BooleanField extends BaseField {
  type: 'boolean'
  defaultValue?: boolean
}

export interface DateField extends BaseField {
  type: 'date'
}

export interface SelectField extends BaseField {
  type: 'select'
  options: readonly string[]
}

export interface MediaField extends BaseField {
  type: 'media'
}

export interface RelationField extends BaseField {
  type: 'relation'
  collection: string
}

export type Field =
  | TextField
  | RichtextField
  | NumberField
  | BooleanField
  | DateField
  | SelectField
  | MediaField
  | RelationField

// ─── Collection definition ────────────────────────────────────────────────────

export interface CollectionDefinition<TFields extends Record<string, Field> = Record<string, Field>> {
  fields: TFields
  label?: string
  slug?: string
}

// ─── CMS Config ───────────────────────────────────────────────────────────────

export interface CMSConfig<TCollections extends Record<string, CollectionDefinition> = Record<string, CollectionDefinition>> {
  collections: TCollections
}

// ─── Infer TypeScript types from field definitions ────────────────────────────

type InferFieldType<F extends Field> =
  F extends TextField ? string :
  F extends RichtextField ? string :
  F extends NumberField ? number :
  F extends BooleanField ? boolean :
  F extends DateField ? string :
  F extends SelectField ? F['options'][number] :
  F extends MediaField ? { key: string; url: string } :
  F extends RelationField ? string :
  never

type InferRequired<F extends Field, T> = F['required'] extends true ? T : T | null

export type InferFieldValue<F extends Field> = InferRequired<F, InferFieldType<F>>

export type InferCollectionRecord<C extends CollectionDefinition> = {
  [K in keyof C['fields']]: InferFieldValue<C['fields'][K]>
} & { id: number; createdAt: string; updatedAt: string }

export type InferCollections<T extends CMSConfig> = {
  [K in keyof T['collections']]: InferCollectionRecord<T['collections'][K]>
}

