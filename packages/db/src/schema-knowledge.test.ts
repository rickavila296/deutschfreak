import { describe, expect, it } from 'vitest';
import * as s from './schema.ts';
import {
  checks,
  columns,
  enumValues,
  foreignKeys,
  indexes,
  primaryKeys,
  standard,
  tableName,
  textNotNull,
  textNull,
  timestamps,
  uniques,
  uuidNotNull,
  uuidNull,
} from './testing/table-config.ts';

// Phase 2b tables 7 to 24: Schema §8.7 to 8.24 and the matching rows of §9, with decisions 0005 (DB-REC-01 to 12)
// and 0007 (lesson_blocks.mode). Every foreign key is indexed (Schema §9 Indexes), either by its own index or by
// a unique constraint or primary key that leads with it.

const idx = (name: string, cols: string[], unique = false, partial = false) => ({
  name,
  columns: cols,
  unique,
  partial,
});

describe('enumerated types for tables 7 to 24 (Schema §8, DB-REC-12)', () => {
  it.each([
    [s.cefrLevel, 'cefr_level', ['A1', 'A2', 'B1', 'B2']],
    [s.sectionWeight, 'section_weight', ['heavy', 'normal', 'light']],
    [s.blockKind, 'block_kind', ['text', 'vocabulary', 'phrase', 'concept', 'example', 'dialogue', 'exercise']],
    [s.blockStatus, 'block_status', ['productive', 'chunk', 'recognition']],
    [s.conceptType, 'concept_type', ['grammar', 'pronunciation', 'pattern']],
    [s.wordClass, 'word_class', ['noun', 'verb', 'adjective', 'adverb', 'function_word']],
    [s.nounArticle, 'noun_article', ['der', 'die', 'das']],
    [s.vocabularyTier, 'vocabulary_tier', ['core_active', 'secondary_active', 'recognition']],
    [s.register, 'register', ['neutral', 'formal', 'informal']],
    [s.audioVariant, 'audio_variant', ['normal', 'slow']],
    [s.productionMethod, 'production_method', ['synthetic', 'human']],
    [s.reviewMode, 'review_mode', ['recognise', 'recall', 'produce']],
  ] as const)('%#: %s', (e, name, values) => {
    expect(e.enumName).toBe(name);
    expect(enumValues(e)).toEqual(values);
  });

  it('exercise_type has the 18 types', () => {
    expect(s.exerciseType.enumName).toBe('exercise_type');
    expect(enumValues(s.exerciseType)).toEqual([
      'multiple_choice',
      'matching',
      'fill_blank',
      'sentence_ordering',
      'translation',
      'listening_selection',
      'listening_dictation',
      'article_selection',
      'gender_selection',
      'vocabulary_recall',
      'sentence_building',
      'reading_comprehension',
      'writing',
      'speaking',
      'pronunciation_repetition',
      'dialogue_completion',
      'roleplay',
      'image_labelling',
    ]);
  });
});

describe('8.7 lesson_sections', () => {
  const t = s.lessonSections;
  it('has its columns', () => {
    expect(tableName(t)).toBe('lesson_sections');
    expect(columns(t)).toEqual({
      ...standard,
      lesson_id: uuidNotNull,
      stage: { type: 'smallint', notNull: true },
      weight: { type: 'section_weight', notNull: true, default: 'normal' },
    });
  });
  it('cascades from its lesson (DB-DEL-01)', () => {
    expect(foreignKeys(t)).toEqual([{ column: 'lesson_id', table: 'lessons', onDelete: 'cascade' }]);
  });
  it('has a unique code and one section per stage (DB-UQ-01, DB-UQ-06)', () => {
    expect(uniques(t)).toEqual([
      { name: 'lesson_sections_code_key', columns: ['code'] },
      { name: 'lesson_sections_lesson_id_stage_key', columns: ['lesson_id', 'stage'] },
    ]);
  });
  it('checks the stage is 1 to 9 (DB-CK-03)', () => {
    expect(checks(t)).toEqual(['lesson_sections_stage_check']);
  });
});

describe('8.8 lesson_blocks', () => {
  const t = s.lessonBlocks;
  it('has its columns, including mode (decision 0007)', () => {
    expect(tableName(t)).toBe('lesson_blocks');
    expect(columns(t)).toEqual({
      ...standard,
      section_id: uuidNotNull,
      position: { type: 'integer', notNull: true },
      kind: { type: 'block_kind', notNull: true },
      role: { type: 'block_role', notNull: false },
      status: { type: 'block_status', notNull: false },
      text_en: textNull,
      vocabulary_item_id: uuidNull,
      phrase_id: uuidNull,
      concept_id: uuidNull,
      example_id: uuidNull,
      dialogue_id: uuidNull,
      exercise_id: uuidNull,
      mode: { type: 'review_mode', notNull: false },
    });
  });
  it('cascades from its section and restricts every target (DB-DEL-01, DB-DEL-02)', () => {
    expect(foreignKeys(t)).toEqual([
      { column: 'concept_id', table: 'concepts', onDelete: 'restrict' },
      { column: 'dialogue_id', table: 'dialogues', onDelete: 'restrict' },
      { column: 'example_id', table: 'examples', onDelete: 'restrict' },
      { column: 'exercise_id', table: 'exercises', onDelete: 'restrict' },
      { column: 'phrase_id', table: 'phrases', onDelete: 'restrict' },
      { column: 'section_id', table: 'lesson_sections', onDelete: 'cascade' },
      { column: 'vocabulary_item_id', table: 'vocabulary_items', onDelete: 'restrict' },
    ]);
  });
  it('has a unique code and position within the section (DB-UQ-01, DB-UQ-07)', () => {
    expect(uniques(t)).toEqual([
      { name: 'lesson_blocks_code_key', columns: ['code'] },
      { name: 'lesson_blocks_section_id_position_key', columns: ['section_id', 'position'] },
    ]);
  });
  it('checks one target, that it matches the kind, and that only exercise blocks carry a mode (DB-CK-01, DB-CK-02, decision 0007)', () => {
    expect(checks(t)).toEqual([
      'lesson_blocks_kind_target_check',
      'lesson_blocks_mode_check',
      'lesson_blocks_one_target_check',
    ]);
  });
  it('indexes each target column (DB-IX-02)', () => {
    expect(indexes(t)).toEqual([
      idx('lesson_blocks_concept_id_idx', ['concept_id']),
      idx('lesson_blocks_dialogue_id_idx', ['dialogue_id']),
      idx('lesson_blocks_example_id_idx', ['example_id']),
      idx('lesson_blocks_exercise_id_idx', ['exercise_id']),
      idx('lesson_blocks_phrase_id_idx', ['phrase_id']),
      idx('lesson_blocks_vocabulary_item_id_idx', ['vocabulary_item_id']),
    ]);
  });
});

describe('8.9 concepts and 8.10 concept_prerequisites', () => {
  it('concepts has its columns and a unique code and slug', () => {
    expect(tableName(s.concepts)).toBe('concepts');
    expect(columns(s.concepts)).toEqual({
      ...standard,
      slug: textNotNull,
      type: { type: 'concept_type', notNull: true },
      title: textNotNull,
      explanation_en: textNotNull,
      level: { type: 'cefr_level', notNull: true },
    });
    expect(uniques(s.concepts)).toEqual([
      { name: 'concepts_code_key', columns: ['code'] },
      { name: 'concepts_slug_key', columns: ['slug'] },
    ]);
  });
  it('concept_prerequisites is keyed on the pair, cascades from the concept, restricts the requirement', () => {
    const t = s.conceptPrerequisites;
    expect(tableName(t)).toBe('concept_prerequisites');
    expect(columns(t)).toEqual({ concept_id: uuidNotNull, requires_concept_id: uuidNotNull, ...timestamps });
    expect(primaryKeys(t)).toEqual([['concept_id', 'requires_concept_id']]);
    expect(foreignKeys(t)).toEqual([
      { column: 'concept_id', table: 'concepts', onDelete: 'cascade' },
      { column: 'requires_concept_id', table: 'concepts', onDelete: 'restrict' },
    ]);
    expect(checks(t)).toEqual(['concept_prerequisites_not_self_check']);
    expect(indexes(t)).toEqual([idx('concept_prerequisites_requires_concept_id_idx', ['requires_concept_id'])]);
  });
});

describe('8.11 vocabulary_items', () => {
  const t = s.vocabularyItems;
  it('has its columns, a unique code and slug, and the article check (DB-CK-05)', () => {
    expect(tableName(t)).toBe('vocabulary_items');
    expect(columns(t)).toEqual({
      ...standard,
      slug: textNotNull,
      lemma: textNotNull,
      word_class: { type: 'word_class', notNull: true },
      article: { type: 'noun_article', notNull: false },
      plural: textNull,
      meaning_en: textNotNull,
      tier: { type: 'vocabulary_tier', notNull: true },
      level: { type: 'cefr_level', notNull: true },
    });
    expect(uniques(t)).toEqual([
      { name: 'vocabulary_items_code_key', columns: ['code'] },
      { name: 'vocabulary_items_slug_key', columns: ['slug'] },
    ]);
    expect(checks(t)).toEqual(['vocabulary_items_article_check']);
  });
});

describe('8.12 phrases and 8.13 examples', () => {
  it('phrases has its columns, register defaulting to neutral', () => {
    expect(tableName(s.phrases)).toBe('phrases');
    expect(columns(s.phrases)).toEqual({
      ...standard,
      slug: textNotNull,
      german: textNotNull,
      meaning_en: textNotNull,
      register: { type: 'register', notNull: true, default: 'neutral' },
      level: { type: 'cefr_level', notNull: true },
    });
    expect(uniques(s.phrases)).toEqual([
      { name: 'phrases_code_key', columns: ['code'] },
      { name: 'phrases_slug_key', columns: ['slug'] },
    ]);
  });
  it('examples has its columns and no slug', () => {
    expect(tableName(s.examples)).toBe('examples');
    expect(columns(s.examples)).toEqual({
      ...standard,
      german: textNotNull,
      meaning_en: textNotNull,
      level: { type: 'cefr_level', notNull: true },
    });
    expect(uniques(s.examples)).toEqual([{ name: 'examples_code_key', columns: ['code'] }]);
  });
});

describe('8.14 example_vocabulary and 8.15 example_concepts', () => {
  it.each([
    [s.exampleVocabulary, 'example_vocabulary', 'vocabulary_item_id', 'vocabulary_items'],
    [s.exampleConcepts, 'example_concepts', 'concept_id', 'concepts'],
  ] as const)('%#: %s cascades from the example and restricts the target', (t, name, col, target) => {
    expect(tableName(t)).toBe(name);
    expect(columns(t)).toEqual({ example_id: uuidNotNull, [col]: uuidNotNull, ...timestamps });
    expect(primaryKeys(t)).toEqual([['example_id', col]]);
    expect(foreignKeys(t)).toEqual(
      [
        { column: 'example_id', table: 'examples', onDelete: 'cascade' },
        { column: col, table: target, onDelete: 'restrict' },
      ].sort((x, y) => x.column.localeCompare(y.column)),
    );
    expect(indexes(t)).toEqual([idx(`${name}_${col}_idx`, [col])]);
  });
});

describe('8.16 dialogues and 8.17 dialogue_lines', () => {
  it('dialogues has its columns', () => {
    expect(tableName(s.dialogues)).toBe('dialogues');
    expect(columns(s.dialogues)).toEqual({
      ...standard,
      slug: textNotNull,
      title: textNotNull,
      register: { type: 'register', notNull: true },
    });
    expect(uniques(s.dialogues)).toEqual([
      { name: 'dialogues_code_key', columns: ['code'] },
      { name: 'dialogues_slug_key', columns: ['slug'] },
    ]);
  });
  it('dialogue_lines cascades from the dialogue and restricts the voice (DB-DEL-05, DB-DEL-07)', () => {
    const t = s.dialogueLines;
    expect(tableName(t)).toBe('dialogue_lines');
    expect(columns(t)).toEqual({
      ...standard,
      dialogue_id: uuidNotNull,
      position: { type: 'integer', notNull: true },
      speaker_role: textNotNull,
      german: textNotNull,
      meaning_en: textNotNull,
      voice_id: uuidNotNull,
    });
    expect(foreignKeys(t)).toEqual([
      { column: 'dialogue_id', table: 'dialogues', onDelete: 'cascade' },
      { column: 'voice_id', table: 'voices', onDelete: 'restrict' },
    ]);
    expect(uniques(t)).toEqual([
      { name: 'dialogue_lines_code_key', columns: ['code'] },
      { name: 'dialogue_lines_dialogue_id_position_key', columns: ['dialogue_id', 'position'] },
    ]);
    expect(indexes(t)).toEqual([idx('dialogue_lines_voice_id_idx', ['voice_id'])]);
  });
});

describe('8.18 topics, 8.19 vocabulary_topics and 8.20 voices', () => {
  it('topics has a unique code and slug', () => {
    expect(tableName(s.topics)).toBe('topics');
    expect(columns(s.topics)).toEqual({ ...standard, slug: textNotNull, title: textNotNull });
    expect(uniques(s.topics)).toEqual([
      { name: 'topics_code_key', columns: ['code'] },
      { name: 'topics_slug_key', columns: ['slug'] },
    ]);
  });
  it('vocabulary_topics cascades from the word and restricts the topic', () => {
    const t = s.vocabularyTopics;
    expect(tableName(t)).toBe('vocabulary_topics');
    expect(columns(t)).toEqual({ vocabulary_item_id: uuidNotNull, topic_id: uuidNotNull, ...timestamps });
    expect(primaryKeys(t)).toEqual([['vocabulary_item_id', 'topic_id']]);
    expect(foreignKeys(t)).toEqual([
      { column: 'topic_id', table: 'topics', onDelete: 'restrict' },
      { column: 'vocabulary_item_id', table: 'vocabulary_items', onDelete: 'cascade' },
    ]);
    expect(indexes(t)).toEqual([idx('vocabulary_topics_topic_id_idx', ['topic_id'])]);
  });
  it('voices has a name and three optional descriptions', () => {
    expect(tableName(s.voices)).toBe('voices');
    expect(columns(s.voices)).toEqual({
      ...standard,
      name: textNotNull,
      gender: textNull,
      age_band: textNull,
      region: textNull,
    });
    expect(uniques(s.voices)).toEqual([{ name: 'voices_code_key', columns: ['code'] }]);
  });
});

describe('8.21 audio_assets', () => {
  const t = s.audioAssets;
  it('has its columns and no code', () => {
    expect(tableName(t)).toBe('audio_assets');
    expect(columns(t)).toEqual({
      id: standard.id,
      vocabulary_item_id: uuidNull,
      phrase_id: uuidNull,
      example_id: uuidNull,
      dialogue_line_id: uuidNull,
      voice_id: uuidNotNull,
      variant: { type: 'audio_variant', notNull: true, default: 'normal' },
      production_method: { type: 'production_method', notNull: true },
      storage_key: textNotNull,
      duration_ms: { type: 'integer', notNull: false },
      text_hash: textNotNull,
      verified_at: { type: 'timestamp with time zone', notNull: false },
      ...timestamps,
    });
  });
  it('is deleted with its owner and restricts the voice (DB-DEL-06, DB-DEL-07)', () => {
    expect(foreignKeys(t)).toEqual([
      { column: 'dialogue_line_id', table: 'dialogue_lines', onDelete: 'cascade' },
      { column: 'example_id', table: 'examples', onDelete: 'cascade' },
      { column: 'phrase_id', table: 'phrases', onDelete: 'cascade' },
      { column: 'vocabulary_item_id', table: 'vocabulary_items', onDelete: 'cascade' },
      { column: 'voice_id', table: 'voices', onDelete: 'restrict' },
    ]);
  });
  it('has one owner and a positive duration (DB-CK-07)', () => {
    expect(checks(t)).toEqual(['audio_assets_duration_ms_check', 'audio_assets_one_owner_check']);
  });
  it('is unique on storage_key and on owner, voice and variant through four partial indexes (DB-UQ-10)', () => {
    expect(uniques(t)).toEqual([{ name: 'audio_assets_storage_key_key', columns: ['storage_key'] }]);
    expect(indexes(t)).toEqual([
      idx(
        'audio_assets_dialogue_line_id_voice_id_variant_key',
        ['dialogue_line_id', 'voice_id', 'variant'],
        true,
        true,
      ),
      idx('audio_assets_example_id_voice_id_variant_key', ['example_id', 'voice_id', 'variant'], true, true),
      idx('audio_assets_phrase_id_voice_id_variant_key', ['phrase_id', 'voice_id', 'variant'], true, true),
      idx(
        'audio_assets_vocabulary_item_id_voice_id_variant_key',
        ['vocabulary_item_id', 'voice_id', 'variant'],
        true,
        true,
      ),
      idx('audio_assets_voice_id_idx', ['voice_id']),
    ]);
  });
});

describe('8.22 exercises, 8.23 exercise_items and 8.24 exercise_targets', () => {
  it('exercises has its columns', () => {
    expect(tableName(s.exercises)).toBe('exercises');
    expect(columns(s.exercises)).toEqual({
      ...standard,
      type: { type: 'exercise_type', notNull: true },
      skill: { type: 'skill', notNull: true },
      instruction_en: textNotNull,
    });
    expect(uniques(s.exercises)).toEqual([{ name: 'exercises_code_key', columns: ['code'] }]);
  });
  it('exercise_items cascades from the exercise and restricts the example (DB-DEL-02, DB-DEL-05)', () => {
    const t = s.exerciseItems;
    expect(tableName(t)).toBe('exercise_items');
    expect(columns(t)).toEqual({
      ...standard,
      exercise_id: uuidNotNull,
      position: { type: 'integer', notNull: true },
      payload: { type: 'jsonb', notNull: true },
      feedback_en: textNull,
      example_id: uuidNull,
    });
    expect(foreignKeys(t)).toEqual([
      { column: 'example_id', table: 'examples', onDelete: 'restrict' },
      { column: 'exercise_id', table: 'exercises', onDelete: 'cascade' },
    ]);
    expect(uniques(t)).toEqual([
      { name: 'exercise_items_code_key', columns: ['code'] },
      { name: 'exercise_items_exercise_id_position_key', columns: ['exercise_id', 'position'] },
    ]);
    expect(indexes(t)).toEqual([idx('exercise_items_example_id_idx', ['example_id'])]);
  });
  it('exercise_targets has one target, unique per exercise, and no code (DB-CK-08, DB-UQ-11)', () => {
    const t = s.exerciseTargets;
    expect(tableName(t)).toBe('exercise_targets');
    expect(columns(t)).toEqual({
      id: standard.id,
      exercise_id: uuidNotNull,
      concept_id: uuidNull,
      vocabulary_item_id: uuidNull,
      phrase_id: uuidNull,
      objective_id: uuidNull,
      ...timestamps,
    });
    expect(foreignKeys(t)).toEqual([
      { column: 'concept_id', table: 'concepts', onDelete: 'restrict' },
      { column: 'exercise_id', table: 'exercises', onDelete: 'cascade' },
      { column: 'objective_id', table: 'learning_objectives', onDelete: 'restrict' },
      { column: 'phrase_id', table: 'phrases', onDelete: 'restrict' },
      { column: 'vocabulary_item_id', table: 'vocabulary_items', onDelete: 'restrict' },
    ]);
    expect(checks(t)).toEqual(['exercise_targets_one_target_check']);
    expect(indexes(t)).toEqual([
      idx('exercise_targets_concept_id_idx', ['concept_id']),
      idx('exercise_targets_exercise_id_concept_id_key', ['exercise_id', 'concept_id'], true, true),
      idx('exercise_targets_exercise_id_idx', ['exercise_id']),
      idx('exercise_targets_exercise_id_objective_id_key', ['exercise_id', 'objective_id'], true, true),
      idx('exercise_targets_exercise_id_phrase_id_key', ['exercise_id', 'phrase_id'], true, true),
      idx('exercise_targets_exercise_id_vocabulary_item_id_key', ['exercise_id', 'vocabulary_item_id'], true, true),
      idx('exercise_targets_objective_id_idx', ['objective_id']),
      idx('exercise_targets_phrase_id_idx', ['phrase_id']),
      idx('exercise_targets_vocabulary_item_id_idx', ['vocabulary_item_id']),
    ]);
  });
});
