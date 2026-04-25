export async function getMenu(system, slug) {
    return system.menu.get(slug);
}
export async function getMenus(system) {
    return system.menu.list();
}
export async function getMenuItems(system, slug) {
    const menu = await system.menu.get(slug);
    return menu?.items ?? [];
}
//# sourceMappingURL=menu.js.map