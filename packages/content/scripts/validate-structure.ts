// Validates packages/content/structure/a1.yaml. Run with `pnpm content:check` from the repo root.
import { checkA1StructureFile } from '../src/structure.ts';

const { ok, counts, problems } = checkA1StructureFile();

if (counts) {
  console.log(
    `a1.yaml: ${counts.parts} parts, ${counts.units} units, ${counts.lessons} lessons, ${counts.objectives} objectives`,
  );
}
if (ok) {
  console.log('a1.yaml: valid (schema, unique and well-formed codes, Spec §20 counts)');
} else {
  console.error(`a1.yaml: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exitCode = 1;
}
