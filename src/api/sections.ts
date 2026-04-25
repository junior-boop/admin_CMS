import type { SystemClient } from '../system/client.js'
import type { Section, Widget } from '../system/types.js'

export async function getSections(
  system: SystemClient,
  page: string
): Promise<Section[]> {
  return system.sections.listByPage(page)
}

export async function getWidgets(
  system: SystemClient,
  area: string
): Promise<Widget[]> {
  return system.widgets.listByArea(area)
}
