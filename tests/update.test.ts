import { describe, expect, it, mock, beforeEach } from "bun:test";
import { createSystemClient } from "../src/system/client";
import { createMockD1 } from "./mocks";

describe("SystemClient Update Logic", () => {
  let db: D1Database;

  beforeEach(() => {
    db = createMockD1();
  });

  it("should update only provided fields in section", async () => {
    const client = createSystemClient(db);
    const mockSection = { id: 42, title: "New Title", page: "home", type: "hero" };

    // @ts-ignore
    db.prepare.mockImplementation((sql) => {
        // Verify the SQL contains only the fields we're updating
        if (sql.includes("UPDATE")) {
            expect(sql).toContain("title = ?");
            expect(sql).not.toContain("content = ?");
            expect(sql).not.toContain("order_index = ?");
        }
        return {
            bind: mock(() => ({
                first: mock(async () => mockSection)
            }))
        }
    });

    const updated = await client.sections.update(42, { title: "New Title" });
    expect(updated).toEqual(mockSection as any);
  });

  it("should handle order field specifically", async () => {
    const client = createSystemClient(db);

    // @ts-ignore
    db.prepare.mockImplementation((sql) => {
        if (sql.includes("UPDATE")) {
            expect(sql).toContain("order_index = ?");
        }
        return {
            bind: mock(() => ({
                first: mock(async () => ({}))
            }))
        }
    });

    await client.sections.update(42, { order: 10 });
  });

  it("should throw error for invalid column", async () => {
    const client = createSystemClient(db);
    // @ts-ignore
    expect(client.sections.update(42, { malicious: "injection" }))
      .rejects.toThrow("Invalid column: malicious");
  });
});
