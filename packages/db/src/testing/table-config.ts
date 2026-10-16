import { getTableConfig, type PgTable } from 'drizzle-orm/pg-core';

// Helpers for schema tests: read a Drizzle table definition as plain data that can be compared with Schema §8 and §9.

export type Column = { type: string; notNull: boolean; default?: string };

export function columns(table: PgTable): Record<string, Column> {
  const out: Record<string, Column> = {};
  for (const c of getTableConfig(table).columns) {
    const entry: Column = { type: c.getSQLType(), notNull: c.notNull };
    if (c.default !== undefined) entry.default = typeof c.default === 'object' ? 'sql' : String(c.default);
    out[c.name] = entry;
  }
  return out;
}

export function foreignKeys(table: PgTable) {
  return getTableConfig(table)
    .foreignKeys.map((fk) => {
      const ref = fk.reference();
      return {
        column: ref.columns.map((c) => c.name).join(','),
        table: getTableConfig(ref.foreignTable).name,
        onDelete: fk.onDelete,
      };
    })
    .sort((a, b) => a.column.localeCompare(b.column));
}

export function uniques(table: PgTable) {
  return getTableConfig(table)
    .uniqueConstraints.map((u) => ({ name: u.name, columns: u.columns.map((c) => c.name) }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export function indexes(table: PgTable) {
  return getTableConfig(table)
    .indexes.map((i) => ({
      name: i.config.name,
      columns: i.config.columns.map((c) => ('name' in c ? c.name : '')),
      unique: i.config.unique,
      partial: i.config.where !== undefined,
    }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export const checks = (table: PgTable) =>
  getTableConfig(table)
    .checks.map((c) => c.name)
    .sort();

export const primaryKeys = (table: PgTable) =>
  getTableConfig(table).primaryKeys.map((pk) => pk.columns.map((c) => c.name));

export const tableName = (table: PgTable) => getTableConfig(table).name;

export const enumValues = (e: { enumValues: readonly string[] }) => [...e.enumValues];

export const timestamps = {
  created_at: { type: 'timestamp with time zone', notNull: true, default: 'sql' },
  updated_at: { type: 'timestamp with time zone', notNull: true, default: 'sql' },
};

/** id, code, created_at, updated_at: the standard columns of a content table with a code (Schema §8). */
export const standard = {
  id: { type: 'uuid', notNull: true, default: 'sql' },
  code: { type: 'text', notNull: true },
  ...timestamps,
};

export const uuidNotNull = { type: 'uuid', notNull: true };
export const uuidNull = { type: 'uuid', notNull: false };
export const textNotNull = { type: 'text', notNull: true };
export const textNull = { type: 'text', notNull: false };
