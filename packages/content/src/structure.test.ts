import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { A1_STRUCTURE_PATH, checkA1StructureFile } from './structure.ts';

describe('a1.yaml (Plan Phase 1 session 3, TRD-CNT-01)', () => {
  it('has 4 parts, 24 units and 92 lessons with unique, well-formed codes (Spec §20)', () => {
    const result = checkA1StructureFile();
    expect(result.problems).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.counts).toMatchObject({ parts: 4, units: 24, lessons: 92 });
  });

  it('has exactly one objective per lesson, 92 in all (decision 0002)', () => {
    expect(checkA1StructureFile().counts!.objectives).toBe(92);
  });

  it('fails a copy of the file with one lesson code duplicated', () => {
    const broken = readFileSync(A1_STRUCTURE_PATH, 'utf8').replace('code: "A1.1.U01.L02"', 'code: "A1.1.U01.L01"');
    const dir = mkdtempSync(join(tmpdir(), 'df-a1-'));
    try {
      const path = join(dir, 'a1.yaml');
      writeFileSync(path, broken);
      const result = checkA1StructureFile(path);
      expect(result.ok).toBe(false);
      expect(result.problems.some((p) => p.includes('Duplicate code A1.1.U01.L01'))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
