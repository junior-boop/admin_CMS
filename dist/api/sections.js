export async function getSections(system, page) {
    return system.sections.listByPage(page);
}
export async function getWidgets(system, area) {
    return system.widgets.listByArea(area);
}
//# sourceMappingURL=sections.js.map