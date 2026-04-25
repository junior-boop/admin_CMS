import type { SystemClient } from '../system/client.js'
import type { MenuWithItems, MenuItem } from '../system/types.js'

export async function getMenu(
  system: SystemClient,
  slug: string
): Promise<MenuWithItems | null> {
  return system.menu.get(slug)
}

export async function getMenus(system: SystemClient) {
  return system.menu.list()
}

export async function getMenuItems(
  system: SystemClient,
  slug: string
): Promise<MenuItem[]> {
  const menu = await system.menu.get(slug)
  return menu?.items ?? []
}
