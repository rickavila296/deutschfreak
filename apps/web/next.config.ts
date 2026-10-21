import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import { loadWebEnv } from './src/lib/root-env.ts';

// Locally the settings live in the repo-root `.env`, shared with apps/api (see .env.example). Next.js only reads
// .env files in apps/web, so NEXT_PUBLIC_API_URL, and nothing else, is taken from the root file here, before the
// build inlines it. Variables already set (on Vercel, in CI) are kept. On Vercel the file does not exist.
loadWebEnv(fileURLToPath(new URL('../../.env', import.meta.url)));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // packages/validation ships TypeScript source (TRD-FE-05: the web app reuses the API's Zod schemas).
  transpilePackages: ['@deutschfreak/validation'],
};

export default nextConfig;
