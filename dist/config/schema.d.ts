import { z } from 'zod';
export declare const cmsConfigSchema: z.ZodObject<{
    collections: z.ZodRecord<z.ZodString, z.ZodObject<{
        fields: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            required: z.ZodOptional<z.ZodBoolean>;
            label: z.ZodOptional<z.ZodString>;
        } & {
            type: z.ZodLiteral<"text">;
            maxLength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            required?: boolean | undefined;
            label?: string | undefined;
            maxLength?: number | undefined;
        }, {
            type: "text";
            required?: boolean | undefined;
            label?: string | undefined;
            maxLength?: number | undefined;
        }>, z.ZodObject<{
            required: z.ZodOptional<z.ZodBoolean>;
            label: z.ZodOptional<z.ZodString>;
        } & {
            type: z.ZodLiteral<"richtext">;
        }, "strip", z.ZodTypeAny, {
            type: "richtext";
            required?: boolean | undefined;
            label?: string | undefined;
        }, {
            type: "richtext";
            required?: boolean | undefined;
            label?: string | undefined;
        }>, z.ZodObject<{
            required: z.ZodOptional<z.ZodBoolean>;
            label: z.ZodOptional<z.ZodString>;
        } & {
            type: z.ZodLiteral<"number">;
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "number";
            required?: boolean | undefined;
            label?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
        }, {
            type: "number";
            required?: boolean | undefined;
            label?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
        }>, z.ZodObject<{
            required: z.ZodOptional<z.ZodBoolean>;
            label: z.ZodOptional<z.ZodString>;
        } & {
            type: z.ZodLiteral<"boolean">;
            defaultValue: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            type: "boolean";
            required?: boolean | undefined;
            label?: string | undefined;
            defaultValue?: boolean | undefined;
        }, {
            type: "boolean";
            required?: boolean | undefined;
            label?: string | undefined;
            defaultValue?: boolean | undefined;
        }>, z.ZodObject<{
            required: z.ZodOptional<z.ZodBoolean>;
            label: z.ZodOptional<z.ZodString>;
        } & {
            type: z.ZodLiteral<"date">;
        }, "strip", z.ZodTypeAny, {
            type: "date";
            required?: boolean | undefined;
            label?: string | undefined;
        }, {
            type: "date";
            required?: boolean | undefined;
            label?: string | undefined;
        }>, z.ZodObject<{
            required: z.ZodOptional<z.ZodBoolean>;
            label: z.ZodOptional<z.ZodString>;
        } & {
            type: z.ZodLiteral<"select">;
            options: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            options: string[];
            type: "select";
            required?: boolean | undefined;
            label?: string | undefined;
        }, {
            options: string[];
            type: "select";
            required?: boolean | undefined;
            label?: string | undefined;
        }>, z.ZodObject<{
            required: z.ZodOptional<z.ZodBoolean>;
            label: z.ZodOptional<z.ZodString>;
        } & {
            type: z.ZodLiteral<"media">;
        }, "strip", z.ZodTypeAny, {
            type: "media";
            required?: boolean | undefined;
            label?: string | undefined;
        }, {
            type: "media";
            required?: boolean | undefined;
            label?: string | undefined;
        }>, z.ZodObject<{
            required: z.ZodOptional<z.ZodBoolean>;
            label: z.ZodOptional<z.ZodString>;
        } & {
            type: z.ZodLiteral<"relation">;
            collection: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "relation";
            collection: string;
            required?: boolean | undefined;
            label?: string | undefined;
        }, {
            type: "relation";
            collection: string;
            required?: boolean | undefined;
            label?: string | undefined;
        }>]>>, Record<string, {
            type: "text";
            required?: boolean | undefined;
            label?: string | undefined;
            maxLength?: number | undefined;
        } | {
            type: "richtext";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "number";
            required?: boolean | undefined;
            label?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
        } | {
            type: "boolean";
            required?: boolean | undefined;
            label?: string | undefined;
            defaultValue?: boolean | undefined;
        } | {
            type: "date";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            options: string[];
            type: "select";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "media";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "relation";
            collection: string;
            required?: boolean | undefined;
            label?: string | undefined;
        }>, Record<string, {
            type: "text";
            required?: boolean | undefined;
            label?: string | undefined;
            maxLength?: number | undefined;
        } | {
            type: "richtext";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "number";
            required?: boolean | undefined;
            label?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
        } | {
            type: "boolean";
            required?: boolean | undefined;
            label?: string | undefined;
            defaultValue?: boolean | undefined;
        } | {
            type: "date";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            options: string[];
            type: "select";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "media";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "relation";
            collection: string;
            required?: boolean | undefined;
            label?: string | undefined;
        }>>;
        label: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fields: Record<string, {
            type: "text";
            required?: boolean | undefined;
            label?: string | undefined;
            maxLength?: number | undefined;
        } | {
            type: "richtext";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "number";
            required?: boolean | undefined;
            label?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
        } | {
            type: "boolean";
            required?: boolean | undefined;
            label?: string | undefined;
            defaultValue?: boolean | undefined;
        } | {
            type: "date";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            options: string[];
            type: "select";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "media";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "relation";
            collection: string;
            required?: boolean | undefined;
            label?: string | undefined;
        }>;
        label?: string | undefined;
        slug?: string | undefined;
    }, {
        fields: Record<string, {
            type: "text";
            required?: boolean | undefined;
            label?: string | undefined;
            maxLength?: number | undefined;
        } | {
            type: "richtext";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "number";
            required?: boolean | undefined;
            label?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
        } | {
            type: "boolean";
            required?: boolean | undefined;
            label?: string | undefined;
            defaultValue?: boolean | undefined;
        } | {
            type: "date";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            options: string[];
            type: "select";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "media";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "relation";
            collection: string;
            required?: boolean | undefined;
            label?: string | undefined;
        }>;
        label?: string | undefined;
        slug?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    collections: Record<string, {
        fields: Record<string, {
            type: "text";
            required?: boolean | undefined;
            label?: string | undefined;
            maxLength?: number | undefined;
        } | {
            type: "richtext";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "number";
            required?: boolean | undefined;
            label?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
        } | {
            type: "boolean";
            required?: boolean | undefined;
            label?: string | undefined;
            defaultValue?: boolean | undefined;
        } | {
            type: "date";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            options: string[];
            type: "select";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "media";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "relation";
            collection: string;
            required?: boolean | undefined;
            label?: string | undefined;
        }>;
        label?: string | undefined;
        slug?: string | undefined;
    }>;
}, {
    collections: Record<string, {
        fields: Record<string, {
            type: "text";
            required?: boolean | undefined;
            label?: string | undefined;
            maxLength?: number | undefined;
        } | {
            type: "richtext";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "number";
            required?: boolean | undefined;
            label?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
        } | {
            type: "boolean";
            required?: boolean | undefined;
            label?: string | undefined;
            defaultValue?: boolean | undefined;
        } | {
            type: "date";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            options: string[];
            type: "select";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "media";
            required?: boolean | undefined;
            label?: string | undefined;
        } | {
            type: "relation";
            collection: string;
            required?: boolean | undefined;
            label?: string | undefined;
        }>;
        label?: string | undefined;
        slug?: string | undefined;
    }>;
}>;
export type ValidatedCMSConfig = z.infer<typeof cmsConfigSchema>;
export declare function validateConfig(config: unknown): ValidatedCMSConfig;
//# sourceMappingURL=schema.d.ts.map