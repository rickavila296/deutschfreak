import { defineConfig, devices } from '@playwright/test';

// End-to-end tests (TRD §22, Plan Phase 4): the real web app against the real API and database. Both are started
// here: the API on the database in the repo-root .env (the dev branch locally), the web app built against it.
// Run with `pnpm test:e2e`. Locally the browser is the installed Microsoft Edge (PLAYWRIGHT_CHANNEL to change it), so
// no browser download is needed.
const apiPort = 4100;
const webPort = 3200;
const apiUrl = `http://localhost:${apiPort}`;
const webUrl = `http://localhost:${webPort}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  reporter: 'list',
  use: { baseURL: webUrl, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'laptop',
      use: { ...devices['Desktop Edge'], channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge' },
    },
    {
      name: 'phone',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @deutschfreak/api start',
      url: `${apiUrl}/health/ready`,
      env: { PORT: String(apiPort), WEB_ORIGIN: webUrl },
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `pnpm exec next build && pnpm exec next start -p ${webPort}`,
      url: webUrl,
      env: { NEXT_PUBLIC_API_URL: apiUrl, NEXT_TELEMETRY_DISABLED: '1' },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
