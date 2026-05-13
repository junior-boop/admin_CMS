import { describe, expect, it, mock, beforeEach } from "bun:test";
import { createCMSClient } from "../src/runtime/client";
import { createMockD1 } from "./mocks";
import { defineConfig, defineFields } from "../src/config/define";

describe("CMSClient (Runtime)", () => {
  const config = defineConfig({
    collections: {
      articles: {
        label: "Articles",
        fields: {
          title: defineFields.text({ required: true }),
        }
      }
    }
  });

  let db: D1Database;

  beforeEach(() => {
    db = createMockD1();
  });

  it("should find records in a collection", async () => {
    const client = createCMSClient(config, { db });
    const mockArticles = [{ id: 1, title: "Hello World", created_at: "", updated_at: "" }];

    // @ts-ignore
    db.prepare.mockImplementation(() => ({
      bind: mock(() => ({
        all: mock(async () => ({ results: mockArticles }))
      }))
    }));

    const articles = await client.articles.find();
    expect(articles).toEqual(mockArticles);
    expect(db.prepare).toHaveBeenCalledWith("SELECT * FROM articles  ORDER BY id asc LIMIT ? OFFSET ?");
  });
});
