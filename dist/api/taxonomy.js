export async function getTags(system) {
    return system.tags.list();
}
export async function getCategories(system) {
    return system.categories.list();
}
export async function getCategoryTree(system) {
    const all = await system.categories.list();
    const roots = all.filter((c) => c.parentId === null);
    return roots.map((root) => ({
        ...root,
        children: all.filter((c) => c.parentId === root.id),
    }));
}
//# sourceMappingURL=taxonomy.js.map