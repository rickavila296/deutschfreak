import { describe, expect, it } from 'vitest';
import {
  blockCodeSchema,
  codeKind,
  conceptCodeSchema,
  dialogueCodeSchema,
  dialogueLineCodeSchema,
  exampleCodeSchema,
  exerciseCodeSchema,
  exerciseItemCodeSchema,
  phraseCodeSchema,
  sectionCodeSchema,
  topicCodeSchema,
  vocabularyCodeSchema,
  voiceCodeSchema,
} from './codes.ts';

// Schema §10 Stable codes: the examples given there must pass; near misses must fail (DB-CODE-01).

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: string) => schema.safeParse(v).success;

describe('knowledge and lesson codes (Schema §10, TRD-CNT-03)', () => {
  it.each([
    [sectionCodeSchema, 'A1.2.U01.L02.S3'],
    [blockCodeSchema, 'A1.2.U01.L02.S3.B02'],
    [conceptCodeSchema, 'G11'],
    [conceptCodeSchema, 'sound:ich-laut'],
    [conceptCodeSchema, 'pattern:time-verb-subject'],
    [vocabularyCodeSchema, 'vocab:gehen'],
    [vocabularyCodeSchema, 'vocab:bank-geld'],
    [phraseCodeSchema, 'phrase:wie-gehts'],
    [exampleCodeSchema, 'eg:ich-moechte-einen-kaffee-01'],
    [dialogueCodeSchema, 'dlg:im-cafe-01'],
    [dialogueLineCodeSchema, 'dlg:im-cafe-01:l03'],
    [exerciseCodeSchema, 'ex:g11-article-selection-01'],
    [exerciseItemCodeSchema, 'ex:g11-article-selection-01:i04'],
    [topicCodeSchema, 'topic:food'],
    [voiceCodeSchema, 'voice:thorsten'],
  ])('%#: accepts %s', (schema, code) => {
    expect(ok(schema, code)).toBe(true);
  });

  it.each([
    [sectionCodeSchema, 'A1.2.U01.L02.S0', 'stage 0'],
    [sectionCodeSchema, 'A1.2.U01.L02.S10', 'stage 10'],
    [blockCodeSchema, 'A1.2.U01.L02.S3.B2', 'unpadded block number'],
    [conceptCodeSchema, 'g11', 'lower-case grammar code'],
    [conceptCodeSchema, 'G1', 'one-digit grammar code'],
    [vocabularyCodeSchema, 'vocab:Gehen', 'upper case'],
    [vocabularyCodeSchema, 'vocab:tschüss', 'umlaut instead of ue'],
    [vocabularyCodeSchema, 'vocab:guten_tag', 'underscore'],
    [phraseCodeSchema, 'phrase:', 'empty slug'],
    [exampleCodeSchema, 'eg:ich-moechte', 'no number'],
    [dialogueLineCodeSchema, 'dlg:im-cafe-01:l3', 'unpadded line number'],
    [exerciseItemCodeSchema, 'ex:g11-article-selection-01:4', 'missing i'],
    [topicCodeSchema, 'food', 'missing prefix'],
  ])('%#: rejects %s (%s)', (schema, code) => {
    expect(ok(schema, code)).toBe(false);
  });
});

describe('codeKind', () => {
  it.each([
    ['G11', 'concept'],
    ['sound:ich-laut', 'concept'],
    ['pattern:time-verb-subject', 'concept'],
    ['vocab:gehen', 'vocabulary'],
    ['phrase:wie-gehts', 'phrase'],
    ['eg:ich-moechte-einen-kaffee-01', 'example'],
    ['dlg:im-cafe-01', 'dialogue'],
    ['ex:g11-article-selection-01', 'exercise'],
    ['A1.1.U01.L01.O1', 'objective'],
    ['vocab:', null],
    ['topic:food', null],
  ])('reads %s as %s', (code, kind) => {
    expect(codeKind(code)).toBe(kind);
  });
});
