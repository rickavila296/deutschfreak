import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

// Locally the settings live in the repo-root `.env`, shared with apps/api (see .env.example). Next.js only reads
// .env files in apps/web, so the root file is loaded here, before the build inlines NEXT_PUBLIC_ values.
// Variables already set (on Vercel, in CI) are kept. On Vercel the file does not exist.
const rootEnvFile = fileURLToPath(new URL('../../.env', import.meta.url));
if (existsSync(rootEnvFile)) process.loadEnvFile(rootEnvFile);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
