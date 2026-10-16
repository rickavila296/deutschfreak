import { getTableConfig, type PgTable } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import {
  blockRole,
  courseParts,
  learningObjectives,
  lessonArchetype,
  lessonObjectives,
  lessons,
  lessonStatus,
  levels,
  skill,
  units,
} from './schema.ts';

// Schema §8.1 to 8.6 and the matching rows of §9, with decisions 0005 (DB-REC-01 to 12) and 0006 (skill).

type Column = { type: string; notNull: boolean; default?: string };

function columns(table: PgTable): Record<string, Column> {
  const out: Record<string, Column> = {};
  for (const c of getTableConfig(table).columns) {
    const entry: Column = { type: c.getSQLType(), notNull: c.notNull };
    if (c.default !== undefined) entry.default = typeof c.default === 'object' ? 'sql' : String(c.default);
    out[c.name] = entry;
  }
  return out;
}

function foreignKeys(table: PgTable) {
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

function uniques(table: PgTable) {
  return getTableConfig(table)
    .uniqueConstraints.map((u) => ({ name: u.name, columns: u.columns.map((c) => c.name) }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

const enumValues = (e: { enumValues: readonly string[] }) => [...e.enumValues];

const timestamps = {
  created_at: { type: 'timestamp with time zone', notNull: true, default: 'sql' },
  updated_at: { type: 'timestamp with time zone', notNull: true, default: 'sql' },
};

const standard = {
  id: { type: 'uuid', notNull: true, default: 'sql' },
  code: { type: 'text', notNull: true },
  ...timestamps,
};

describe('enumerated types (Schema §8, DB-REC-12)', () => {
  it('skill has the eight skills', () => {
    expect(skill.enumName).toBe('skill');
    expect(enumValues(skill)).toEqual([
      'listening',
      'reading',
      'spoken_interaction',
      'spoken_production',
      'writing',
      'vocabulary',
      'grammar',
      'pronunciation',
    ]);
  });

  it('lesson_archetype has the nine archetypes', () => {
    expect(lessonArchetype.enumName).toBe('lesson_archetype');
    expect(enumValues(lessonArchetype)).toEqual([
      'conversation',
      'grammar',
      'vocabulary',
      'pronunciation',
      'reading',
      'listening',
      'writing',
      'integrated',
      'checkpoint',
    ]);
  });

  it('lesson_status is planned, published, retired (DB-REC-05)', () => {
    expect(lessonStatus.enumName).toBe('lesson_status');
    expect(enumValues(lessonStatus)).toEqual(['planned', 'published', 'retired']);
  });

  it('block_role has the four roles', () => {
    expect(blockRole.enumName).toBe('block_role');
    expect(enumValues(blockRole)).toEqual(['introduces', 'reinforces', 'applies', 'assesses']);
  });
});

describe('8.1 levels', () => {
  it('has the standard columns and a title', () => {
    expect(getTableConfig(levels).name).toBe('levels');
    expect(columns(levels)).toEqual({ ...standard, title: { type: 'text', notNull: true } });
  });

  it('has a unique code (DB-UQ-01)', () => {
    expect(uniques(levels)).toEqual([{ name: 'levels_code_key', columns: ['code'] }]);
  });
});

describe('8.2 course_parts', () => {
  it('has its columns', () => {
    expect(getTableConfig(courseParts).name).toBe('course_parts');
    expect(columns(courseParts)).toEqual({
      ...standard,
      level_id: { type: 'uuid', notNull: true },
      title: { type: 'text', notNull: true },
      tagline: { type: 'text', notNull: true },
      position: { type: 'integer', notNull: true },
    });
  });

  it('restricts deleting a level (DB-DEL-03)', () => {
    expect(foreignKeys(courseParts)).toEqual([{ column: 'level_id', table: 'levels', onDelete: 'restrict' }]);
  });

  it('has a unique code and a unique position within the level (DB-UQ-01, DB-UQ-03)', () => {
    expect(uniques(courseParts)).toEqual([
      { name: 'course_parts_code_key', columns: ['code'] },
      { name: 'course_parts_level_id_position_key', columns: ['level_id', 'position'] },
    ]);
  });
});

describe('8.3 units', () => {
  it('has its columns', () => {
    expect(getTableConfig(units).name).toBe('units');
    expect(columns(units)).toEqual({
      ...standard,
      course_part_id: { type: 'uuid', notNull: true },
      slug: { type: 'text', notNull: true },
      title: { type: 'text', notNull: true },
      subtitle_en: { type: 'text', notNull: true },
      context_en: { type: 'text', notNull: false },
      position: { type: 'integer', notNull: true },
    });
  });

  it('restricts deleting a course part (DB-DEL-03)', () => {
    expect(foreignKeys(units)).toEqual([{ column: 'course_part_id', table: 'course_parts', onDelete: 'restrict' }]);
  });

  it('has a unique code, slug and position within the part (DB-UQ-01, 02, 04)', () => {
    expect(uniques(units)).toEqual([
      { name: 'units_code_key', columns: ['code'] },
      { name: 'units_course_part_id_position_key', columns: ['course_part_id', 'position'] },
      { name: 'units_slug_key', columns: ['slug'] },
    ]);
  });
});

describe('8.4 lessons', () => {
  it('has its columns', () => {
    expect(getTableConfig(lessons).name).toBe('lessons');
    expect(columns(lessons)).toEqual({
      ...standard,
      unit_id: { type: 'uuid', notNull: true },
      slug: { type: 'text', notNull: true },
      title: { type: 'text', notNull: true },
      archetypes: { type: 'lesson_archetype[]', notNull: true },
      mastery_task_en: { type: 'text', notNull: true },
      status: { type: 'lesson_status', notNull: true, default: 'planned' },
      revision: { type: 'integer', notNull: true, default: '1' },
      position: { type: 'integer', notNull: true },
    });
  });

  it('restricts deleting a unit (DB-DEL-03)', () => {
    expect(foreignKeys(lessons)).toEqual([{ column: 'unit_id', table: 'units', onDelete: 'restrict' }]);
  });

  it('has a unique code, slug and position within the unit (DB-UQ-01, 02, 05)', () => {
    expect(uniques(lessons)).toEqual([
      { name: 'lessons_code_key', columns: ['code'] },
      { name: 'lessons_slug_key', columns: ['slug'] },
      { name: 'lessons_unit_id_position_key', columns: ['unit_id', 'position'] },
    ]);
  });

  it('requires at least one archetype (DB-CK-04)', () => {
    expect(getTableConfig(lessons).checks.map((c) => c.name)).toEqual(['lessons_archetypes_check']);
  });
});

describe('8.5 learning_objectives', () => {
  it('has its columns, with a required skill (decision 0006)', () => {
    expect(getTableConfig(learningObjectives).name).toBe('learning_objectives');
    expect(columns(learningObjectives)).toEqual({
      ...standard,
      can_do_en: { type: 'text', notNull: true },
      skill: { type: 'skill', notNull: true },
    });
  });

  it('has a unique code and no lesson column', () => {
    expect(uniques(learningObjectives)).toEqual([{ name: 'learning_objectives_code_key', columns: ['code'] }]);
    expect(foreignKeys(learningObjectives)).toEqual([]);
  });
});

describe('8.6 lesson_objectives', () => {
  it('has its columns and no id or code', () => {
    expect(getTableConfig(lessonObjectives).name).toBe('lesson_objectives');
    expect(columns(lessonObjectives)).toEqual({
      lesson_id: { type: 'uuid', notNull: true },
      objective_id: { type: 'uuid', notNull: true },
      role: { type: 'block_role', notNull: true },
      ...timestamps,
    });
  });

  it('is keyed on the pair (DB-REC-08)', () => {
    const pks = getTableConfig(lessonObjectives).primaryKeys.map((pk) => pk.columns.map((c) => c.name));
    expect(pks).toEqual([['lesson_id', 'objective_id']]);
  });

  it('cascades from the lesson and restricts the objective (DB-DEL-02, DB-DEL-04)', () => {
    expect(foreignKeys(lessonObjectives)).toEqual([
      { column: 'lesson_id', table: 'lessons', onDelete: 'cascade' },
      { column: 'objective_id', table: 'learning_objectives', onDelete: 'restrict' },
    ]);
  });

  it('indexes objective_id, the foreign key the primary key does not lead with', () => {
    const indexes = getTableConfig(lessonObjectives).indexes.map((i) => ({
      name: i.config.name,
      columns: i.config.columns.map((c) => ('name' in c ? c.name : '')),
    }));
    expect(indexes).toEqual([{ name: 'lesson_objectives_objective_id_idx', columns: ['objective_id'] }]);
  });
});

describe('Schema §9 delete rules', () => {
  it('never uses SET NULL', () => {
    for (const table of [levels, courseParts, units, lessons, learningObjectives, lessonObjectives]) {
      for (const fk of getTableConfig(table).foreignKeys) expect(fk.onDelete).not.toBe('set null');
    }
  });
});
