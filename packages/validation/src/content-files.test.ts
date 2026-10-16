import { describe, expect, it } from 'vitest';
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
} from './content-files.ts';

// Content file schemas (task 2b.2; TRD-CNT-01 to 08, TRD-VAL-01 and 02; decision 0010). Values are placeholders,
// not curriculum content.

type Schema = { safeParse: (v: unknown) => { success: boolean; error?: { issues: { message: string }[] } } };
const messages = (schema: Schema, data: unknown) => schema.safeParse(data).error?.issues.map((i) => i.message) ?? [];
const valid = (schema: Schema, data: unknown) => expect(messages(schema, data)).toEqual([]);
const invalid = (schema: Schema, data: unknown, message?: string) => {
  const found = messages(schema, data);
  expect(found.length).toBeGreaterThan(0);
  if (message) expect(found).toContain(message);
};

describe('topics.yaml and voices.yaml (decision 0010)', () => {
  const topics = () => ({ topics: [{ code: 'topic:food', slug: 'food', title: 'Food' }] });
  const voices = () => ({
    voices: [
      { code: 'voice:a', name: 'A', gender: 'female' },
      { code: 'voice:b', name: 'B' },
    ],
  });

  it('accepts well-formed files', () => {
    valid(topicsFileSchema, topics());
    valid(voicesFileSchema, voices());
  });

  it('rejects an unknown field (TRD-VAL-02)', () => {
    invalid(topicsFileSchema, { topics: [{ ...topics().topics[0], colour: 'red' }] });
    invalid(voicesFileSchema, { voices: [{ code: 'voice:a', name: 'A', accent: 'x' }] });
  });

  it('rejects a duplicate code or slug', () => {
    const t = topics();
    invalid(
      topicsFileSchema,
      { topics: [t.topics[0], { ...t.topics[0], slug: 'other' }] },
      'Duplicate code topic:food',
    );
    invalid(topicsFileSchema, { topics: [t.topics[0], { ...t.topics[0], code: 'topic:x' }] }, 'Duplicate slug food');
  });
});

describe('concepts/ (Schema §8.9, 8.10)', () => {
  const concept = (code: string, type: string, extra: object = {}) => ({
    code,
    slug: code.replace(/^(sound|pattern):/, '').toLowerCase(),
    type,
    title: 'Title',
    explanation_en: 'Explanation',
    level: 'A1',
    ...extra,
  });

  it('accepts grammar, pronunciation and pattern concepts with prerequisites', () => {
    valid(conceptsFileSchema, {
      concepts: [
        concept('G01', 'grammar'),
        concept('G02', 'grammar', { requires: ['G01'] }),
        concept('sound:ich-laut', 'pronunciation'),
        concept('pattern:time-verb-subject', 'pattern'),
      ],
    });
  });

  it('rejects a type that does not match the code', () => {
    invalid(conceptsFileSchema, { concepts: [concept('G01', 'pronunciation')] }, 'G01 must have type grammar');
    invalid(conceptsFileSchema, { concepts: [concept('sound:ich-laut', 'grammar')] });
  });

  it('rejects a concept that requires itself (DB-CK-06) or a malformed requirement', () => {
    invalid(
      conceptsFileSchema,
      { concepts: [concept('G01', 'grammar', { requires: ['G01'] })] },
      'G01 requires itself',
    );
    invalid(conceptsFileSchema, { concepts: [concept('G01', 'grammar', { requires: ['vocab:gehen'] })] });
  });

  it('rejects a level outside the enum', () => {
    invalid(conceptsFileSchema, { concepts: [concept('G01', 'grammar', { level: 'C1' })] });
  });
});

describe('vocabulary/<topic>.yaml (Schema §8.11, 8.19; decision 0010)', () => {
  const noun = {
    code: 'vocab:tisch',
    slug: 'tisch',
    lemma: 'Tisch',
    word_class: 'noun',
    article: 'der',
    plural: 'Tische',
    meaning_en: 'table',
    tier: 'core_active',
    level: 'A1',
  };
  const verb = {
    code: 'vocab:gehen',
    slug: 'gehen',
    lemma: 'gehen',
    word_class: 'verb',
    meaning_en: 'to go',
    tier: 'core_active',
    level: 'A1',
  };

  it('accepts a file with its topic and words, one listing a further topic', () => {
    valid(vocabularyFileSchema, { topic: 'topic:home', items: [noun, { ...verb, topics: ['topic:travel'] }] });
  });

  it('requires an article on a noun and refuses one elsewhere (DB-CK-05)', () => {
    const bare: Partial<typeof noun> = { ...noun };
    delete bare.article;
    invalid(vocabularyFileSchema, { topic: 'topic:home', items: [bare] }, 'vocab:tisch is a noun and needs an article');
    invalid(
      vocabularyFileSchema,
      { topic: 'topic:home', items: [{ ...verb, article: 'der' }] },
      'vocab:gehen is not a noun and must not have an article',
    );
  });

  it('rejects a missing topic, an unknown word class and a duplicate code', () => {
    invalid(vocabularyFileSchema, { items: [verb] });
    invalid(vocabularyFileSchema, { topic: 'topic:home', items: [{ ...verb, word_class: 'pronoun' }] });
    invalid(
      vocabularyFileSchema,
      { topic: 'topic:home', items: [verb, { ...verb, slug: 'x' }] },
      'Duplicate code vocab:gehen',
    );
  });
});

describe('phrases/ and examples/ (Schema §8.12 to 8.15)', () => {
  const phrase = { code: 'phrase:a-b', slug: 'a-b', german: 'A b.', meaning_en: 'A b.', level: 'A1' };
  const example = { code: 'eg:a-b-01', german: 'A b.', meaning_en: 'A b.', level: 'A1' };

  it('accepts phrases with and without a register', () => {
    valid(phrasesFileSchema, { phrases: [phrase, { ...phrase, code: 'phrase:c', slug: 'c', register: 'formal' }] });
  });

  it('rejects a register outside the closed list', () => {
    invalid(phrasesFileSchema, { phrases: [{ ...phrase, register: 'casual' }] });
  });

  it('accepts examples that link words and concepts by code', () => {
    valid(examplesFileSchema, { examples: [{ ...example, vocabulary: ['vocab:a'], concepts: ['G01', 'sound:x'] }] });
  });

  it('rejects an example link that is not a word or concept code, or is listed twice', () => {
    invalid(examplesFileSchema, { examples: [{ ...example, vocabulary: ['phrase:a'] }] });
    invalid(examplesFileSchema, { examples: [{ ...example, concepts: ['G01', 'G01'] }] }, 'eg:a-b-01 lists G01 twice');
  });
});

describe('dialogues/ (Schema §8.16, 8.17)', () => {
  const line = (n: number, code = `dlg:a-01:l0${n}`) => ({
    code,
    speaker_role: 'A',
    german: 'A.',
    meaning_en: 'A.',
    voice: 'voice:a',
  });
  const dialogue = (lines: object[] = [line(1), line(2)]) => ({
    code: 'dlg:a-01',
    slug: 'a-01',
    title: 'A',
    register: 'informal',
    lines,
  });

  it('accepts a dialogue with lines in order', () => {
    valid(dialoguesFileSchema, { dialogues: [dialogue()] });
  });

  it('rejects a line whose code is not inside its dialogue, a missing voice and a dialogue without lines', () => {
    invalid(
      dialoguesFileSchema,
      { dialogues: [dialogue([line(1, 'dlg:b-01:l01')])] },
      'dlg:b-01:l01 is not inside dlg:a-01',
    );
    const noVoice: Partial<ReturnType<typeof line>> = line(1);
    delete noVoice.voice;
    invalid(dialoguesFileSchema, { dialogues: [dialogue([noVoice])] });
    invalid(dialoguesFileSchema, { dialogues: [dialogue([])] });
  });

  it('rejects a duplicate line code', () => {
    invalid(dialoguesFileSchema, { dialogues: [dialogue([line(1), line(1)])] }, 'Duplicate code dlg:a-01:l01');
  });
});

describe('exercises/ (Schema §8.22 to 8.24; decision 0010)', () => {
  const item = (n: number, extra: object = {}) => ({ code: `ex:a-01:i0${n}`, payload: { prompt: 'x' }, ...extra });
  const exercise = (extra: object = {}) => ({
    code: 'ex:a-01',
    type: 'multiple_choice',
    skill: 'grammar',
    instruction_en: 'Choose.',
    targets: ['G01', 'vocab:a', 'phrase:b', 'A1.1.U01.L01.O1'],
    items: [item(1, { feedback_en: 'Because.', example: 'eg:a-01' }), item(2)],
    ...extra,
  });

  it('accepts an exercise with mixed targets and items; any JSON object as payload for now (decision 0010)', () => {
    valid(exercisesFileSchema, { exercises: [exercise()] });
  });

  it('rejects a payload that is not an object', () => {
    invalid(exercisesFileSchema, { exercises: [exercise({ items: [item(1, { payload: 'answer' })] })] });
    invalid(exercisesFileSchema, { exercises: [exercise({ items: [item(1, { payload: ['a'] })] })] });
  });

  it('rejects a target that is not a concept, word, phrase or objective, or a target listed twice (DB-UQ-11)', () => {
    invalid(
      exercisesFileSchema,
      { exercises: [exercise({ targets: ['eg:a-01'] })] },
      'eg:a-01 cannot be an exercise target',
    );
    invalid(exercisesFileSchema, { exercises: [exercise({ targets: ['G01', 'G01'] })] }, 'ex:a-01 lists G01 twice');
  });

  it('rejects an item outside its exercise, an unknown type and an exercise without items', () => {
    invalid(
      exercisesFileSchema,
      { exercises: [exercise({ items: [{ code: 'ex:b-01:i01', payload: {} }] })] },
      'ex:b-01:i01 is not inside ex:a-01',
    );
    invalid(exercisesFileSchema, { exercises: [exercise({ type: 'crossword' })] });
    invalid(exercisesFileSchema, { exercises: [exercise({ items: [] })] });
  });
});

describe('lessons/<code>.yaml (Schema §8.7, 8.8; TRD-CNT-02, TRD-CNT-08; decisions 0007, 0010)', () => {
  const L = 'A1.1.U01.L01';
  type Block = {
    code: string;
    kind: string;
    ref?: string;
    text_en?: string;
    role?: string;
    status?: string;
    mode?: string;
  };
  const lesson = () => ({
    lesson: L,
    sections: [
      {
        code: `${L}.S1`,
        stage: 1,
        weight: 'light',
        blocks: [
          { code: `${L}.S1.B01`, kind: 'text', text_en: 'Intro' },
          { code: `${L}.S1.B02`, kind: 'vocabulary', ref: 'vocab:a', role: 'introduces', status: 'productive' },
        ] as Block[],
      },
      {
        code: `${L}.S7`,
        stage: 7,
        blocks: [{ code: `${L}.S7.B01`, kind: 'exercise', ref: 'ex:a-01', mode: 'recall' }] as Block[],
      },
      // The other seven stages, without blocks: a lesson file holds all nine sections (DB-INT-08, review finding 5).
      ...[2, 3, 4, 5, 6, 8, 9].map((stage) => ({ code: `${L}.S${stage}`, stage, blocks: [] as Block[] })),
    ],
  });
  type LessonData = ReturnType<typeof lesson>;
  const edit = (f: (l: LessonData) => void) => {
    const l = lesson();
    f(l);
    return l;
  };

  it('accepts a lesson that arranges references by code', () => {
    valid(lessonFileSchema, lesson());
  });

  it('rejects a lesson file without all nine sections (DB-INT-08, review finding 5)', () => {
    invalid(
      lessonFileSchema,
      edit((l) => l.sections.pop()),
      `${L} has 8 sections; a lesson file needs all 9`,
    );
  });

  it('rejects a section code that does not match its lesson and stage', () => {
    invalid(
      lessonFileSchema,
      edit((l) => (l.sections[0]!.code = `${L}.S2`)),
      `${L}.S2 must be ${L}.S1 (lesson and stage)`,
    );
  });

  it('rejects two sections for one stage (DB-UQ-06)', () => {
    invalid(
      lessonFileSchema,
      edit((l) => (l.sections[1]!.stage = 1)),
    );
  });

  it('rejects a block outside its section', () => {
    invalid(
      lessonFileSchema,
      edit((l) => (l.sections[0]!.blocks[0]!.code = `${L}.S2.B01`)),
      `${L}.S2.B01 is not inside ${L}.S1`,
    );
  });

  it('rejects a text block with a target and another block without one (DB-CK-01)', () => {
    invalid(
      lessonFileSchema,
      edit((l) => Object.assign(l.sections[0]!.blocks[0]!, { ref: 'vocab:a' })),
      `${L}.S1.B01 is a text block and must not have a ref`,
    );
    invalid(
      lessonFileSchema,
      edit((l) => delete (l.sections[0]!.blocks[1] as { ref?: string }).ref),
      `${L}.S1.B02 needs a ref`,
    );
  });

  it('rejects a target that does not match the block kind (DB-CK-02)', () => {
    invalid(
      lessonFileSchema,
      edit((l) => (l.sections[0]!.blocks[1]!.ref = 'phrase:a')),
      `${L}.S1.B02 is a vocabulary block but phrase:a is not a vocabulary code`,
    );
  });

  it('rejects a mode on a block that is not an exercise (decision 0007)', () => {
    invalid(
      lessonFileSchema,
      edit((l) => Object.assign(l.sections[0]!.blocks[1]!, { mode: 'recall' })),
      `${L}.S1.B02 has a mode but only exercise blocks may`,
    );
  });

  it('rejects a duplicate block code, an unknown field and a stage outside 1 to 9', () => {
    invalid(
      lessonFileSchema,
      edit((l) => (l.sections[0]!.blocks[1]!.code = `${L}.S1.B01`)),
      `Duplicate code ${L}.S1.B01`,
    );
    invalid(
      lessonFileSchema,
      edit((l) => Object.assign(l.sections[0]!, { title: 'x' })),
    );
    invalid(
      lessonFileSchema,
      edit((l) => (l.sections[0]!.stage = 10)),
    );
  });
});
