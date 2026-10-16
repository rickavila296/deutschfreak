import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// Architecture rule 1 (TRD §6): only apps/api talks to the database, so apps/web never imports packages/db.
export const noDbInWeb = {
  files: ['apps/web/**/*.{js,jsx,ts,tsx,mjs,cjs}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@deutschfreak/db', '@deutschfreak/db/*', '**/packages/db', '**/packages/db/**'],
            message: 'apps/web must not import packages/db. Fetch data from the API instead (architecture rule 1).',
          },
        ],
      },
    ],
  },
};

export default tseslint.config(
  { ignores: ['docs/**', '.claude/**', '**/node_modules/**', '**/dist/**', '**/.next/**', '**/coverage/**'] },
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
