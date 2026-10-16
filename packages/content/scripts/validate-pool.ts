// Validates the knowledge pool and lesson files. Run with `pnpm content:check` from the repo root.
import { countContent, loadContentFiles } from '../src/pool.ts';

const { files, problems } = loadContentFiles();
const c = countContent(files);
console.log(
  `pool: ${c.topics} topics, ${c.voices} voices, ${c.concepts} concepts, ${c.vocabulary} words, ${c.phrases} phrases, ` +
    `${c.examples} examples, ${c.dialogues} dialogues (${c.dialogueLines} lines), ${c.exercises} exercises ` +
    `(${c.exerciseItems} items), ${c.lessons} lesson files`,
);
if (problems.length === 0) {
  console.log('pool: every file valid');
} else {
  console.error(`pool: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exitCode = 1;
}
