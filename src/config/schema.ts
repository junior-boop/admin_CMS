import { z } from 'zod'

const baseFieldSchema = z.object({
  required: z.boolean().optional(),
  label: z.string().optional(),
})

const fieldSchema = z.discriminatedUnion('type', [
  baseFieldSchema.extend({ type: z.literal('text'), maxLength: z.number().optional() }),
  baseFieldSchema.extend({ type: z.literal('richtext') }),
  baseFieldSchema.extend({ type: z.literal('number'), min: z.number().optional(), max: z.number().optional() }),
  baseFieldSchema.extend({ type: z.literal('boolean'), defaultValue: z.boolean().optional() }),
  baseFieldSchema.extend({ type: z.literal('date') }),
  baseFieldSchema.extend({ type: z.literal('select'), options: z.array(z.string()).min(1) }),
  baseFieldSchema.extend({ type: z.literal('media') }),
  baseFieldSchema.extend({ type: z.literal('relation'), collection: z.string().min(1) }),
])

const collectionSchema = z.object({
  fields: z.record(z.string(), fieldSchema).refine(
    (fields) => Object.keys(fields).length > 0,
    { message: 'A collection must have at least one field' }
  ),
  label: z.string().optional(),
  slug: z.string().optional(),
})

export const cmsConfigSchema = z.object({
  collections: z.record(z.string(), collectionSchema).refine(
    (cols) => Object.keys(cols).length > 0,
    { message: 'Config must define at least one collection' }
  ),
})

export type ValidatedCMSConfig = z.infer<typeof cmsConfigSchema>

export function validateConfig(config: unknown): ValidatedCMSConfig {
  return cmsConfigSchema.parse(config)
}
