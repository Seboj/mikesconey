import { db } from "../db/index.js";
import { siteContent } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function getContent(key: string): Promise<unknown | null> {
  const results = await db
    .select()
    .from(siteContent)
    .where(eq(siteContent.key, key))
    .limit(1);

  return results[0]?.value ?? null;
}

export async function updateContent(
  key: string,
  value: unknown
): Promise<{ key: string; value: unknown; updatedAt: Date }> {
  const [updated] = await db
    .insert(siteContent)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: { value, updatedAt: new Date() },
    })
    .returning();

  return updated;
}
