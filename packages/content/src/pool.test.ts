import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTENT_ROOT, countContent, loadContentFiles } from './pool.ts';

describe('knowledge pool and lesson files (task 2b.3; TRD-CNT-01, DB-IMP-01; decisions 0010, 0011)', () => {
  it('validates every content file against its schema', () => {
    expect(loadContentFiles().problems).toEqual([]);
  });

  it('holds all 50 A1 concepts: 27 grammar and 23 pronunciation (decision 0007)', () => {
    const concepts = loadContentFiles().files.concepts.flatMap((f) => f.concepts);
    expect(concepts.filter((c) => c.type === 'grammar')).toHaveLength(27);
    expect(concepts.filter((c) => c.type === 'pronunciation')).toHaveLength(23);
    expect(concepts.filter((c) => c.type === 'grammar').map((c) => c.code)).toEqual(
      Array.from({ length: 27 }, (_, i) => `G${String(i + 1).padStart(2, '0')}`),
    );
  });

  it('has two voices and one lesson file, A1.1.U01.L01, with all nine stages (decision 0011)', () => {
    const { files } = loadContentFiles();
    expect(countContent(files)).toMatchObject({ voices: 2, lessons: 1 });
    expect(files.lessons[0]!.lesson).toBe('A1.1.U01.L01');
    expect(files.lessons[0]!.sections.map((s) => s.stage)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  /** Writes the given files into a temporary content folder and loads it. */
  function loadFrom(files: Record<string, string>) {
    const dir = mkdtempSync(join(tmpdir(), 'df-pool-'));
    try {
      for (const [name, text] of Object.entries(files)) {
        mkdirSync(join(dir, name, '..'), { recursive: true });
        writeFileSync(join(dir, name), text);
      }
      return loadContentFiles(dir).problems;
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  const phrase = (code: string, slug: string) =>
    `phrases:\n  - code: "${code}"\n    slug: "${slug}"\n    german: "X"\n    meaning_en: "x"\n    level: A1\n`;

  it('rejects a code defined in two files (review finding 3)', () => {
    expect(
      loadFrom({ 'phrases/a.yaml': phrase('phrase:x', 'x'), 'phrases/b.yaml': phrase('phrase:x', 'y') }),
    ).toContain('Duplicate code phrase:x in phrases/a.yaml and phrases/b.yaml');
  });

  it('rejects a slug used in two files of the same table (review finding 3)', () => {
    expect(
      loadFrom({ 'phrases/a.yaml': phrase('phrase:x', 'same'), 'phrases/b.yaml': phrase('phrase:y', 'same') }),
    ).toContain('Duplicate phrases slug same in phrases/a.yaml and phrases/b.yaml');
  });

  it('rejects a lesson file whose name does not match its lesson code (review finding 3)', () => {
    const lesson = readFileSync(join(CONTENT_ROOT, 'lessons', 'A1.1.U01.L01.yaml'), 'utf8');
    expect(loadFrom({ 'lessons/copy.yaml': lesson })).toContain(
      'lessons/copy.yaml holds A1.1.U01.L01; a lesson file is named after its lesson: A1.1.U01.L01.yaml',
    );
  });

  it('reports a broken file with its name instead of skipping it', () => {
    const dir = mkdtempSync(join(tmpdir(), 'df-pool-'));
    try {
      mkdirSync(join(dir, 'phrases'));
      writeFileSync(join(dir, 'phrases', 'bad.yaml'), 'phrases:\n  - code: "phrase:x"\n    colour: red\n');
      const { problems } = loadContentFiles(dir);
      expect(problems.length).toBeGreaterThan(0);
      expect(problems.every((p) => p.startsWith('phrases/bad.yaml: '))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
