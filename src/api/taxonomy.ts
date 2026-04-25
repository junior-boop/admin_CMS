import type { SystemClient } from '../system/client.js'
import type { Tag, Category } from '../system/types.js'

export async function getTags(system: SystemClient): Promise<Tag[]> {
  return system.tags.list()
}

export async function getCategories(system: SystemClient): Promise<Category[]> {
  return system.categories.list()
}

export async function getCategoryTree(system: SystemClient): Promise<(Category & { children: Category[] })[]> {
  const all = await system.categories.list()
  const roots = all.filter((c) => c.parentId === null)
  return roots.map((root) => ({
    ...root,
    children: all.filter((c) => c.parentId === root.id),
  }))
}
