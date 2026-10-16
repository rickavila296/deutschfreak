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

  function read<T>(paths: string[], schema: Schema<T>): T[] {
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
      if (result.success) out.push(result.data);
      else for (const i of result.error.issues) problems.push(`${name}: ${i.path.join('.') || '(root)'}: ${i.message}`);
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
  return { files, problems };
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
