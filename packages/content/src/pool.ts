import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  conceptsFileSchema,
  dialoguesFileSchema,
  examplesFileSchema,
  exercisesFileSchema,
  lessonFileSchema,
  phrasesFileSchema,
  topicsFileSchema,
  vocabularyFileSchema,
  voicesFileSchema,
  type ConceptsFile,
  type DialoguesFile,
  type ExamplesFile,
  type ExercisesFile,
  type LessonFile,
  type PhrasesFile,
  type TopicsFile,
  type VocabularyFile,
  type VoicesFile,
} from '@deutschfreak/validation';

// Reads the knowledge pool and lesson files (TRD-CNT-01, decision 0010) and validates each against its schema
// (DB-IMP-01). Cross-file references are resolved by the importer (TRD-CNT-06), not here.

export const CONTENT_ROOT = fileURLToPath(new URL('..', import.meta.url));

export interface ContentFiles {
  topics: TopicsFile[];
  voices: VoicesFile[];
  concepts: ConceptsFile[];
  vocabulary: VocabularyFile[];
  phrases: PhrasesFile[];
  examples: ExamplesFile[];
  dialogues: DialoguesFile[];
  exercises: ExercisesFile[];
  lessons: LessonFile[];
}

export interface ContentLoadResult {
  files: ContentFiles;
  /** One line per problem, prefixed with the file it is in. Empty when every file is valid. */
  problems: string[];
}

type Schema<T> = {
  safeParse: (
    v: unknown,
  ) => { success: true; data: T } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };
};

/** YAML files directly in `dir`, sorted, or none if the folder does not exist. */
function yamlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .sort()
    .map((f) => join(dir, f));
}

export function loadContentFiles(root: string = CONTENT_ROOT): ContentLoadResult {
  const problems: string[] = [];

  // File name of every parsed file, for the cross-file checks below.
  const names = new Map<object, string>();

  function read<T extends object>(paths: string[], schema: Schema<T>): T[] {
    const out: T[] = [];
    for (const path of paths) {
      const name = relative(root, path).replaceAll('\\', '/');
      let data: unknown;
      try {
        // uniqueKeys rejects a key written twice in one mapping, which would otherwise overwrite silently.
        data = parse(readFileSync(path, 'utf8'), { uniqueKeys: true });
      } catch (error) {
        problems.push(`${name}: ${(error as Error).message}`);
        continue;
      }
      const result = schema.safeParse(data);
      if (result.success) {
        out.push(result.data);
        names.set(result.data, name);
      } else
        for (const i of result.error.issues) problems.push(`${name}: ${i.path.join('.') || '(root)'}: ${i.message}`);
    }
    return out;
  }

  const file = (name: string) => (existsSync(join(root, name)) ? [join(root, name)] : []);
  const files: ContentFiles = {
    topics: read(file('topics.yaml'), topicsFileSchema),
    voices: read(file('voices.yaml'), voicesFileSchema),
    concepts: read(yamlFiles(join(root, 'concepts')), conceptsFileSchema),
    vocabulary: read(yamlFiles(join(root, 'vocabulary')), vocabularyFileSchema),
    phrases: read(yamlFiles(join(root, 'phrases')), phrasesFileSchema),
    examples: read(yamlFiles(join(root, 'examples')), examplesFileSchema),
    dialogues: read(yamlFiles(join(root, 'dialogues')), dialoguesFileSchema),
    exercises: read(yamlFiles(join(root, 'exercises')), exercisesFileSchema),
    lessons: read(yamlFiles(join(root, 'lessons')), lessonFileSchema),
  };
  problems.push(...crossFileProblems(files, (file) => names.get(file) ?? '?'));
  return { files, problems };
}

/**
 * Checks the files can only make together (review finding 3): a code or slug defined in two files of the same table,
 * and a lesson file not named after its lesson (which also stops two files claiming one lesson). Duplicates inside one
 * file are already reported by its schema.
 */
function crossFileProblems(files: ContentFiles, nameOf: (file: object) => string): string[] {
  const problems: string[] = [];
  function unique<F extends object>(label: string, list: F[], keys: (f: F) => string[]) {
    const seen = new Map<string, string>();
    for (const file of list) {
      const name = nameOf(file);
      for (const key of new Set(keys(file))) {
        const first = seen.get(key);
        if (first !== undefined && first !== name) problems.push(`Duplicate ${label} ${key} in ${first} and ${name}`);
        else seen.set(key, name);
      }
    }
  }
  // Codes: each table has its own prefix, so one check per table also covers the whole pool.
  unique('code', files.topics, (f) => f.topics.map((t) => t.code));
  unique('code', files.voices, (f) => f.voices.map((v) => v.code));
  unique('code', files.concepts, (f) => f.concepts.map((c) => c.code));
  unique('code', files.vocabulary, (f) => f.items.map((w) => w.code));
  unique('code', files.phrases, (f) => f.phrases.map((p) => p.code));
  unique('code', files.examples, (f) => f.examples.map((e) => e.code));
  unique('code', files.dialogues, (f) => f.dialogues.flatMap((d) => [d.code, ...d.lines.map((l) => l.code)]));
  unique('code', files.exercises, (f) => f.exercises.flatMap((e) => [e.code, ...e.items.map((i) => i.code)]));
  // Slugs are unique within their table (DB-UQ-02).
  unique('topics slug', files.topics, (f) => f.topics.map((t) => t.slug));
  unique('concepts slug', files.concepts, (f) => f.concepts.map((c) => c.slug));
  unique('vocabulary slug', files.vocabulary, (f) => f.items.map((w) => w.slug));
  unique('phrases slug', files.phrases, (f) => f.phrases.map((p) => p.slug));
  unique('dialogues slug', files.dialogues, (f) => f.dialogues.map((d) => d.slug));
  for (const lesson of files.lessons) {
    const name = nameOf(lesson);
    const expected = `lessons/${lesson.lesson}.yaml`;
    if (name !== expected) {
      problems.push(`${name} holds ${lesson.lesson}; a lesson file is named after its lesson: ${lesson.lesson}.yaml`);
    }
  }
  return problems;
}

/** Number of rows each kind of content file defines. */
export function countContent(files: ContentFiles) {
  return {
    topics: files.topics.flatMap((f) => f.topics).length,
    voices: files.voices.flatMap((f) => f.voices).length,
    concepts: files.concepts.flatMap((f) => f.concepts).length,
    vocabulary: files.vocabulary.flatMap((f) => f.items).length,
    phrases: files.phrases.flatMap((f) => f.phrases).length,
    examples: files.examples.flatMap((f) => f.examples).length,
    dialogues: files.dialogues.flatMap((f) => f.dialogues).length,
    dialogueLines: files.dialogues.flatMap((f) => f.dialogues.flatMap((d) => d.lines)).length,
    exercises: files.exercises.flatMap((f) => f.exercises).length,
    exerciseItems: files.exercises.flatMap((f) => f.exercises.flatMap((e) => e.items)).length,
    lessons: files.lessons.length,
  };
}
