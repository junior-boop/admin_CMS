import type { CMSConfig, CollectionDefinition, Field, TextField, RichtextField, NumberField, BooleanField, DateField, SelectField, MediaField, RelationField } from './types.js';
export declare function defineConfig<T extends Record<string, CollectionDefinition>>(config: CMSConfig<T>): CMSConfig<T>;
export declare function defineCollections<T extends Record<string, Field>>(definition: CollectionDefinition<T>): CollectionDefinition<T>;
export declare const defineFields: {
    text(options?: Omit<TextField, "type">): TextField;
    richtext(options?: Omit<RichtextField, "type">): RichtextField;
    number(options?: Omit<NumberField, "type">): NumberField;
    boolean(options?: Omit<BooleanField, "type">): BooleanField;
    date(options?: Omit<DateField, "type">): DateField;
    select<const TOptions extends readonly string[]>(options: readonly TOptions[number][] | TOptions, rest?: Omit<SelectField, "type" | "options">): SelectField;
    media(options?: Omit<MediaField, "type">): MediaField;
    relation(collection: string, options?: Omit<RelationField, "type" | "collection">): RelationField;
};
//# sourceMappingURL=define.d.ts.map