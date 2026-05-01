function asCached(cms) {
    return cms;
}
export async function getCollection(cms, collection, options) {
    const client = cms[collection];
    if (!client)
        throw new Error(`Collection "${collection}" not found in CMS config`);
    return client.find(options);
}
export async function getEntry(cms, collection, id) {
    const client = cms[collection];
    if (!client)
        throw new Error(`Collection "${collection}" not found in CMS config`);
    return client.findOne(id);
}
export async function createEntry(cms, collection, data) {
    const client = cms[collection];
    if (!client)
        throw new Error(`Collection "${collection}" not found in CMS config`);
    const result = await client.create(data);
    if ('state' in cms) {
        await asCached(cms).state.invalidateCollection(collection);
    }
    return result;
}
export async function updateEntry(cms, collection, id, data) {
    const client = cms[collection];
    if (!client)
        throw new Error(`Collection "${collection}" not found in CMS config`);
    const result = await client.update(id, data);
    if ('state' in cms) {
        await asCached(cms).state.invalidate(`cms:${collection}:${id}`);
        await asCached(cms).state.invalidateCollection(collection);
    }
    return result;
}
export async function deleteEntry(cms, collection, id) {
    const client = cms[collection];
    if (!client)
        throw new Error(`Collection "${collection}" not found in CMS config`);
    await client.delete(id);
    if ('state' in cms) {
        await asCached(cms).state.invalidate(`cms:${collection}:${id}`);
        await asCached(cms).state.invalidateCollection(collection);
    }
}
export async function invalidateCollectionCache(cms, collection) {
    if ('state' in cms) {
        await cms.state.invalidateCollection(collection);
    }
}
//# sourceMappingURL=collections.js.map