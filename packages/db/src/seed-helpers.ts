import { and, eq, inArray, notInArray, sql, type SQL } from 'drizzle-orm';
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import type { PgColumn, PgDatabase, PgTable } from 'drizzle-orm/pg-core';
import type * as schema from './schema.ts';

// Helpers shared by the structure seed (seed.ts) and the content seed (seed-content.ts).

export type Db = PgDatabase<NodePgQueryResultHKT, typeof schema>;

export interface SeedReport {
  /** Rows inserted or updated per table. */
  written: Record<string, number>;
  /** Codes in the database that the files no longer have, as "table code". Reported, never deleted (DB-IMP-07). */
  absent: string[];
  /** Parts of an imported lesson, dialogue or exercise that its file no longer has, deleted (decision 0013). */
  removed: string[];
}

/** The value an upsert would have written, for `onConflictDoUpdate`. */
export const excluded = (column: string) => sql.raw(`excluded."${column}"`);
export const now = sql`now()`;

export type Ids = Map<string, string>;

/** Maps each code to its id, from rows returned by an upsert. */
export const idsByCode = (rows: { id: string; code: string }[]): Ids => new Map(rows.map((r) => [r.code, r.id]));

export function idOf(ids: Ids, code: string): string {
  const id = ids.get(code);
  if (!id) throw new Error(`Unknown code ${code}`); // DB-CODE-06: fail loudly
  return id;
}

/** Ids of rows that already exist in the database, by code. */
export async function existing(
  db: Db,
  table: PgTable & { id: PgColumn; code: PgColumn },
  codes: string[],
): Promise<Ids> {
  if (codes.length === 0) return new Map();
  const rows = (await db.select({ id: table.id, code: table.code }).from(table).where(inArray(table.code, codes))) as {
    id: string;
    code: string;
  }[];
  return idsByCode(rows);
}

/** Deletes the owner's links that the file no longer has, then inserts the ones it lists (DB-IMP-06). */
export async function rewriteLinks(
  db: Db,
  table: PgTable,
  ownerColumn: PgColumn,
  targetColumn: PgColumn,
  ownerId: string,
  targetIds: string[],
  row: (targetId: string) => Record<string, unknown>,
) {
  const stale: SQL | undefined =
    targetIds.length > 0
      ? and(eq(ownerColumn, ownerId), notInArray(targetColumn, targetIds))
      : eq(ownerColumn, ownerId);
  await db.delete(table).where(stale);
  if (targetIds.length > 0) await db.insert(table).values(targetIds.map(row)).onConflictDoNothing();
}

/** Codes in `table` that the files do not contain (DB-IMP-07). */
export async function absentCodes(db: Db, table: string, fileCodes: string[]): Promise<string[]> {
  const { rows } = await db.execute<{ code: string }>(
    sql`select code from ${sql.identifier(table)} where code <> all(${sql.param(fileCodes)}::text[]) order by code`,
  );
  return rows.map((r) => `${table} ${r.code}`);
}
