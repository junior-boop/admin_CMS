/// <reference types="@cloudflare/workers-types" />
declare module 'virtual:astro-cms/config' {
  export type FieldType =
    | 'text' | 'richtext' | 'number' | 'boolean'
    | 'date' | 'select' | 'media' | 'relation'

  interface BaseField { type: FieldType; required?: boolean; label?: string }
  interface TextField extends BaseField { type: 'text'; maxLength?: number }
  interface RichtextField extends BaseField { type: 'richtext' }
  interface NumberField extends BaseField { type: 'number'; min?: number; max?: number }
  interface BooleanField extends BaseField { type: 'boolean'; defaultValue?: boolean }
  interface DateField extends BaseField { type: 'date' }
  interface SelectField extends BaseField { type: 'select'; options: readonly string[] }
  interface MediaField extends BaseField { type: 'media' }
  interface RelationField extends BaseField { type: 'relation'; collection: string }
  type Field = TextField | RichtextField | NumberField | BooleanField | DateField | SelectField | MediaField | RelationField

  interface CollectionDefinition { fields: Record<string, Field>; label?: string; slug?: string }
  interface CMSConfig { collections: Record<string, CollectionDefinition> }

  const config: CMSConfig
  export default config
}