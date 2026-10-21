import type { ContentFiles } from '@deutschfreak/content';
import type { StructureFile } from '@deutschfreak/validation';
import { and, eq, notInArray } from 'drizzle-orm';
import { courseParts, learningObjectives, lessonObjectives, lessons, levels, units } from './schema.ts';
import { seedContent } from './seed-content.ts';
import { absentCodes, excluded, idOf, idsByCode, now, type Db, type SeedReport } from './seed-helpers.ts';

export type { Db, SeedReport } from './seed-helpers.ts';

// Seed runner for a1.yaml (Plan task 2a.4; Schema §10, DB-IMP-01 to 09). Every row is upserted on its code;
// codes, slugs and titles come literally from the file and are never computed (DB-INT-02).
// Positions are 1-based file order. `status` and `revision` are left to the lesson importer, so a reseed never
// unpublishes a lesson. The importer never touches a learner table (DB-IMP-09).

/** Writes the structure tree. Call it inside a transaction; `seed` does that for you. */
export async function seedStructure(db: Db, file: StructureFile): Promise<SeedReport> {
  const { level } = file;
  const parts = level.parts.map((part, i) => ({ part, position: i + 1 }));
  const unitRows = level.parts.flatMap((part) => part.units.map((unit, i) => ({ part, unit, position: i + 1 })));
  const lessonRows = unitRows.flatMap(({ unit }) =>
    unit.lessons.map((lesson, i) => ({ unit, lesson, position: i + 1 })),
  );
  const objectiveRows = lessonRows.flatMap(({ lesson }) =>
    lesson.objectives.map((objective) => ({ lesson, objective })),
  );

  const levelIds = idsByCode(
    await db
      .insert(levels)
      .values({ code: level.code, title: level.title })
      .onConflictDoUpdate({ target: levels.code, set: { title: excluded('title'), updatedAt: now } })
      .returning({ id: levels.id, code: levels.code }),
  );

  const partIds = idsByCode(
    await db
      .insert(courseParts)
      .values(
        parts.map(({ part, position }) => ({
          code: part.code,
          levelId: idOf(levelIds, level.code),
          title: part.title,
          tagline: part.tagline,
          descriptionEn: part.description_en ?? null,
          position,
        })),
      )
      .onConflictDoUpdate({
        target: courseParts.code,
        set: {
          levelId: excluded('level_id'),
          title: excluded('title'),
          tagline: excluded('tagline'),
          descriptionEn: excluded('description_en'),
          position: excluded('position'),
          updatedAt: now,
        },
      })
      .returning({ id: courseParts.id, code: courseParts.code }),
  );

  const unitIds = idsByCode(
    await db
      .insert(units)
      .values(
        unitRows.map(({ part, unit, position }) => ({
          code: unit.code,
          coursePartId: idOf(partIds, part.code),
          slug: unit.slug,
          title: unit.title,
          subtitleEn: unit.subtitle_en,
          contextEn: unit.context_en ?? null,
          position,
        })),
      )
      .onConflictDoUpdate({
        target: units.code,
        set: {
          coursePartId: excluded('course_part_id'),
          slug: excluded('slug'),
          title: excluded('title'),
          subtitleEn: excluded('subtitle_en'),
          contextEn: excluded('context_en'),
          position: excluded('position'),
          updatedAt: now,
        },
      })
      .returning({ id: units.id, code: units.code }),
  );

  const lessonIds = idsByCode(
    await db
      .insert(lessons)
      .values(
        lessonRows.map(({ unit, lesson, position }) => ({
          code: lesson.code,
          unitId: idOf(unitIds, unit.code),
          slug: lesson.slug,
          title: lesson.title,
          archetypes: lesson.archetypes,
          masteryTaskEn: lesson.mastery_task_en,
          position,
        })),
      )
      .onConflictDoUpdate({
        target: lessons.code,
        set: {
          unitId: excluded('unit_id'),
          slug: excluded('slug'),
          title: excluded('title'),
          archetypes: excluded('archetypes'),
          masteryTaskEn: excluded('mastery_task_en'),
          position: excluded('position'),
          updatedAt: now,
        },
      })
      .returning({ id: lessons.id, code: lessons.code }),
  );

  const objectiveIds = idsByCode(
    await db
      .insert(learningObjectives)
      .values(
        objectiveRows.map(({ objective }) => ({
          code: objective.code,
          canDoEn: objective.can_do_en,
          skill: objective.skill,
        })),
      )
      .onConflictDoUpdate({
        target: learningObjectives.code,
        set: { canDoEn: excluded('can_do_en'), skill: excluded('skill'), updatedAt: now },
      })
      .returning({ id: learningObjectives.id, code: learningObjectives.code }),
  );

  // Link table rewritten to match the file (DB-IMP-06): the objective's own lesson introduces it (Schema §8.6).
  const links = objectiveRows.map(({ lesson, objective }) => ({
    lessonId: idOf(lessonIds, lesson.code),
    objectiveId: idOf(objectiveIds, objective.code),
    role: 'introduces' as const,
  }));
  for (const { lesson } of lessonRows) {
    const lessonId = idOf(lessonIds, lesson.code);
    const keep = lesson.objectives.map((o) => idOf(objectiveIds, o.code));
    await db
      .delete(lessonObjectives)
      .where(and(eq(lessonObjectives.lessonId, lessonId), notInArray(lessonObjectives.objectiveId, keep)));
  }
  await db
    .insert(lessonObjectives)
    .values(links)
    .onConflictDoUpdate({
      target: [lessonObjectives.lessonId, lessonObjectives.objectiveId],
      set: { role: excluded('role'), updatedAt: now },
    });

  const absent = [
    ...(await absentCodes(db, 'levels', [level.code])),
    ...(await absentCodes(db, 'course_parts', [...partIds.keys()])),
    ...(await absentCodes(db, 'units', [...unitIds.keys()])),
    ...(await absentCodes(db, 'lessons', [...lessonIds.keys()])),
    ...(await absentCodes(db, 'learning_objectives', [...objectiveIds.keys()])),
  ];

  return {
    written: {
      levels: levelIds.size,
      course_parts: partIds.size,
      units: unitIds.size,
      lessons: lessonIds.size,
      learning_objectives: objectiveIds.size,
      lesson_objectives: links.length,
    },
    absent,
    removed: [],
  };
}

/**
 * Seeds the structure tree and, if given, the pool and lesson files, in one transaction: any failure rolls back
 * everything (DB-IMP-02, DB-INT-01).
 */
export function seed(db: Db, file: StructureFile, content?: ContentFiles): Promise<SeedReport> {
  return db.transaction(async (tx) => {
    const structure = await seedStructure(tx, file);
    if (!content) return structure;
    const pool = await seedContent(tx, content);
    return {
      written: { ...structure.written, ...pool.written },
      absent: [...structure.absent, ...pool.absent],
      removed: pool.removed,
    };
  });
}
