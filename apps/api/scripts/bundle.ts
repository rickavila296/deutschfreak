// Bundles the API into one JavaScript file, dist/app.js, for Vercel (task 3.8). Run by `pnpm build`, which Vercel runs
// as the build command (vercel.json). Why: the workspace packages export their TypeScript source, and Vercel's own
// compile left their package.json pointing at .ts files that do not exist in the deployed function
// (ERR_MODULE_NOT_FOUND @deutschfreak/validation/src/index.ts). Bundling puts packages/db and packages/validation
// (and their own dependencies, such as pg and drizzle-orm) inside the file. This app's direct npm dependencies stay
// external and are traced by Vercel from apps/api/node_modules.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = new URL('..', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as { dependencies: Record<string, string> };
const external = Object.keys(pkg.dependencies).filter((name) => !name.startsWith('@deutschfreak/'));

await build({
  // fileURLToPath decodes spaces and non-ASCII characters and handles Windows drive letters (review 3 finding 5).
  absWorkingDir: fileURLToPath(root),
  entryPoints: ['src/main.ts'],
  outfile: 'dist/app.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  sourcemap: true,
  // pg loads these optional packages only when asked to; they are not installed.
  external: [...external, 'pg-native', 'pg-cloudflare'],
  // Bundled CommonJS code (pg) calls require(); give the ES module a real one.
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  logLevel: 'info',
});
