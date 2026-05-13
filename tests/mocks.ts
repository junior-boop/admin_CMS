import { describe, expect, it, mock } from "bun:test";

export function createMockD1(): D1Database {
  return {
    prepare: mock((sql: string) => ({
      bind: mock((...args: any[]) => ({
        first: mock(async () => ({})),
        all: mock(async () => ({ results: [] })),
        run: mock(async () => ({})),
      })),
      first: mock(async () => ({})),
      all: mock(async () => ({ results: [] })),
      run: mock(async () => ({})),
    })),
    batch: mock(async () => []),
    exec: mock(async () => ({})),
    dump: mock(async () => new ArrayBuffer(0)),
  } as unknown as D1Database;
}

export function createMockKV(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: mock(async (key: string) => store.get(key) || null),
    put: mock(async (key: string, value: string) => { store.set(key, value); }),
    delete: mock(async (key: string) => { store.delete(key); }),
    list: mock(async (options?: { prefix?: string }) => {
      const keys = Array.from(store.keys())
        .filter(k => !options?.prefix || k.startsWith(options.prefix))
        .map(name => ({ name }));
      return { keys, list_complete: true, cursor: "" };
    }),
  } as unknown as KVNamespace;
}
