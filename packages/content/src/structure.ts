import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { validateA1Structure, type StructureValidationResult } from '@deutschfreak/validation';

export const A1_STRUCTURE_PATH = fileURLToPath(new URL('../structure/a1.yaml', import.meta.url));

/** Reads a1.yaml and validates it: schema, unique and nested codes, and the Spec §20 counts. */
export function checkA1StructureFile(path: string = A1_STRUCTURE_PATH): StructureValidationResult {
  // uniqueKeys rejects a key written twice in one mapping, which would otherwise overwrite silently.
  return validateA1Structure(parse(readFileSync(path, 'utf8'), { uniqueKeys: true }));
}
