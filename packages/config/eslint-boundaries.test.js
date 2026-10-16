import { URL, fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const eslint = new ESLint({ cwd: repoRoot });

async function restrictedImportErrors(code, filePath) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => m.ruleId === 'no-restricted-imports');
}

describe('architecture rule 1: apps/web never imports packages/db', () => {
  it('flags the package import in apps/web', async () => {
    const errors = await restrictedImportErrors(
      "import { db } from '@deutschfreak/db';\nexport { db };\n",
      'apps/web/app/page.ts',
    );
    expect(errors).toHaveLength(1);
  });

  it('flags a relative path into packages/db from apps/web', async () => {
    const errors = await restrictedImportErrors(
      "import { db } from '../../packages/db/src/index';\nexport { db };\n",
      'apps/web/lib/data.ts',
    );
    expect(errors).toHaveLength(1);
  });

  it('allows the same import in apps/api', async () => {
    const errors = await restrictedImportErrors(
      "import { db } from '@deutschfreak/db';\nexport { db };\n",
      'apps/api/src/db.ts',
    );
    expect(errors).toHaveLength(0);
  });
});
