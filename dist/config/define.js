// ─── defineConfig ─────────────────────────────────────────────────────────────
export function defineConfig(config) {
    return config;
}
// ─── defineCollections ────────────────────────────────────────────────────────
export function defineCollections(definition) {
    return definition;
}
// ─── defineFields ─────────────────────────────────────────────────────────────
export const defineFields = {
    text(options = {}) {
        return { type: 'text', ...options };
    },
    richtext(options = {}) {
        return { type: 'richtext', ...options };
    },
    number(options = {}) {
        return { type: 'number', ...options };
    },
    boolean(options = {}) {
        return { type: 'boolean', ...options };
    },
    date(options = {}) {
        return { type: 'date', ...options };
    },
    select(options, rest = {}) {
        return { type: 'select', options: options, ...rest };
    },
    media(options = {}) {
        return { type: 'media', ...options };
    },
    relation(collection, options = {}) {
        return { type: 'relation', collection, ...options };
    },
};
//# sourceMappingURL=define.js.map