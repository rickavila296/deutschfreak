import { URL, fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const eslint = new ESLint({ cwd: repoRoot });

// Rule ids that enforce architecture rule 1: static imports, and dynamic import() or require().
const boundaryRules = new Set(['no-restricted-imports', 'no-restricted-syntax']);

async function dbImportErrors(code, filePath) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => boundaryRules.has(m.ruleId));
}

describe('architecture rule 1: apps/web never imports packages/db', () => {
  it('flags the package import in apps/web', async () => {
    const errors = await dbImportErrors(
      "import { db } from '@deutschfreak/db';\nexport { db };\n",
      'apps/web/app/page.ts',
    );
    expect(errors).toHaveLength(1);
  });

  it('flags a relative path into packages/db from apps/web', async () => {
    const errors = await dbImportErrors(
      "import { db } from '../../packages/db/src/index';\nexport { db };\n",
      'apps/web/lib/data.ts',
    );
    expect(errors).toHaveLength(1);
  });

  it('flags a dynamic import() of packages/db in apps/web', async () => {
    const errors = await dbImportErrors(
      "export const load = () => import('@deutschfreak/db');\n",
      'apps/web/app/lazy.ts',
    );
    expect(errors).toHaveLength(1);
  });

  it('flags a dynamic import() of a subpath through a relative path in apps/web', async () => {
    const errors = await dbImportErrors(
      "export const load = () => import('../../packages/db/src/client');\n",
      'apps/web/lib/lazy.ts',
    );
    expect(errors).toHaveLength(1);
  });

  it('flags require() of packages/db in apps/web', async () => {
    const errors = await dbImportErrors(
      "const { db } = require('@deutschfreak/db');\nmodule.exports = db;\n",
      'apps/web/lib/legacy.cjs',
    );
    expect(errors).toHaveLength(1);
  });

  it('does not flag a dynamic import() of another package in apps/web', async () => {
    const errors = await dbImportErrors(
      "export const load = () => import('@deutschfreak/validation');\n",
      'apps/web/app/lazy.ts',
    );
    expect(errors).toHaveLength(0);
  });

  it('allows the same imports in apps/api', async () => {
    const errors = await dbImportErrors(
      "import { db } from '@deutschfreak/db';\nexport { db };\nexport const load = () => import('@deutschfreak/db');\n",
      'apps/api/src/db.ts',
    );
    expect(errors).toHaveLength(0);
  });
});
