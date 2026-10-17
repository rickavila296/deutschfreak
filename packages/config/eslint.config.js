import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// Architecture rule 1 (TRD §6): only apps/api talks to the database, so apps/web never imports packages/db.
const noDbMessage = 'apps/web must not import packages/db. Fetch data from the API instead (architecture rule 1).';
// Matches @deutschfreak/db and packages/db, with or without a subpath. `.` stands for the slash,
// which esquery regex attributes cannot hold.
const dbSource = String.raw`/^@deutschfreak.db($|.)|(^|.)packages.db($|.)/`;

export const noDbInWeb = {
  files: ['apps/web/**/*.{js,jsx,ts,tsx,mjs,cjs}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@deutschfreak/db', '@deutschfreak/db/*', '**/packages/db', '**/packages/db/**'],
            message: noDbMessage,
          },
        ],
      },
    ],
    // no-restricted-imports only sees static imports; this catches import('…') and require('…').
    'no-restricted-syntax': [
      'error',
      { selector: `ImportExpression[source.value=${dbSource}]`, message: noDbMessage },
      { selector: `CallExpression[callee.name='require'][arguments.0.value=${dbSource}]`, message: noDbMessage },
    ],
  },
};

export default tseslint.config(
  {
    ignores: [
      'docs/**',
      '.claude/**',
      '.vercel/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // TRD-STK-03: no `any`.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  noDbInWeb,
);
