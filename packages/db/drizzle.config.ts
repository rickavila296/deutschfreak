import { defineConfig } from 'drizzle-kit';
import { loadRootEnv, readDatabaseUrl } from './src/env.ts';

// drizzle-kit uses the direct connection string (TRD-DB-14). Migrations are generated and applied, never pushed (TRD-DB-13).
loadRootEnv();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './migrations',
  dbCredentials: { url: readDatabaseUrl('DATABASE_URL_DIRECT') },
  strict: true,
  verbose: true,
});
