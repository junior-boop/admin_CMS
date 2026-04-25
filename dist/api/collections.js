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
    return client.create(data);
}
export async function updateEntry(cms, collection, id, data) {
    const client = cms[collection];
    if (!client)
        throw new Error(`Collection "${collection}" not found in CMS config`);
    return client.update(id, data);
}
export async function deleteEntry(cms, collection, id) {
    const client = cms[collection];
    if (!client)
        throw new Error(`Collection "${collection}" not found in CMS config`);
    return client.delete(id);
}
//# sourceMappingURL=collections.js.map