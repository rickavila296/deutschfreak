import { describe, expect, it } from 'vitest';
import { lessonCodeSchema } from './index';

describe('lessonCodeSchema', () => {
  it('accepts A1.1.U01.L01', () => {
    expect(lessonCodeSchema.safeParse('A1.1.U01.L01').success).toBe(true);
  });

  it('rejects A1.1.U1.L1 (unpadded unit and lesson numbers)', () => {
    expect(lessonCodeSchema.safeParse('A1.1.U1.L1').success).toBe(false);
  });

  it('rejects lowercase', () => {
    expect(lessonCodeSchema.safeParse('a1.1.u01.l01').success).toBe(false);
  });
});
