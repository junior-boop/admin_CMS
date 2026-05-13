import { describe, expect, it, mock, beforeEach } from "bun:test";
import { createSystemClient, createCachedSystemClient } from "../src/system/client";
import { createMockD1, createMockKV } from "./mocks";

describe("SystemClient", () => {
  let db: D1Database;

  beforeEach(() => {
    db = createMockD1();
  });

  it("should list menus", async () => {
    const client = createSystemClient(db);
    const mockResults = [{ id: 1, name: "Main", slug: "main" }];

    // @ts-ignore
    db.prepare.mockImplementation(() => ({
      all: mock(async () => ({ results: mockResults }))
    }));

    const menus = await client.menu.list();
    expect(menus).toEqual(mockResults);
    expect(db.prepare).toHaveBeenCalledWith("SELECT * FROM cms_menus ORDER BY name");
  });

  it("should create a menu", async () => {
    const client = createSystemClient(db);
    const mockMenu = { id: 1, name: "Main", slug: "main" };

    // @ts-ignore
    db.prepare.mockImplementation(() => ({
      bind: mock(() => ({
        first: mock(async () => mockMenu)
      }))
    }));

    const menu = await client.menu.create({ name: "Main", slug: "main" });
    expect(menu).toEqual(mockMenu);
  });
});

describe("CachedSystemClient", () => {
  let db: D1Database;
  let kv: KVNamespace;

  beforeEach(() => {
    db = createMockD1();
    kv = createMockKV();
  });

  it("should cache menu list", async () => {
    const client = createCachedSystemClient(db, kv);
    const mockResults = [{ id: 1, name: "Main", slug: "main" }];

    // @ts-ignore
    db.prepare.mockImplementation(() => ({
      all: mock(async () => ({ results: mockResults }))
    }));

    // First call - fetch from DB
    const menus1 = await client.menu.list();
    expect(menus1).toEqual(mockResults);
    expect(db.prepare).toHaveBeenCalledTimes(1);

    // Second call - should be from cache (memory or KV)
    const menus2 = await client.menu.list();
    expect(menus2).toEqual(mockResults);
    expect(db.prepare).toHaveBeenCalledTimes(1);

    expect(kv.put).toHaveBeenCalled();
  });
});
