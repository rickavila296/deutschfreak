// The Vercel entry for the API (task 3.8, TRD-DEP-01). Vercel serves the default export of this file as one function,
// and only recognises an entry that imports express ("No entrypoint found which imports express"). The app itself is
// built from src/main.ts into dist/app.js by `pnpm build` (scripts/bundle.ts), which Vercel runs first (vercel.json).
import 'express';

export { default } from './dist/app.js';
