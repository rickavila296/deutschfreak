import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  structureFileSchema,
  validateA1Structure,
  type StructureFile,
  type StructureValidationResult,
} from '@deutschfreak/validation';

export const A1_STRUCTURE_PATH = fileURLToPath(new URL('../structure/a1.yaml', import.meta.url));

/** Reads a1.yaml and validates it: schema, unique and nested codes, and the Spec §20 counts. */
export function checkA1StructureFile(path: string = A1_STRUCTURE_PATH): StructureValidationResult {
  // uniqueKeys rejects a key written twice in one mapping, which would otherwise overwrite silently.
  return validateA1Structure(parse(readFileSync(path, 'utf8'), { uniqueKeys: true }));
}

/** Reads and validates a1.yaml for the seed runner. Throws, listing every problem, if the file is not valid. */
export function loadA1Structure(path: string = A1_STRUCTURE_PATH): StructureFile {
  const data: unknown = parse(readFileSync(path, 'utf8'), { uniqueKeys: true });
  const result = validateA1Structure(data);
  if (!result.ok) throw new Error(`a1.yaml is not valid:\n  - ${result.problems.join('\n  - ')}`);
  return structureFileSchema.parse(data);
}
