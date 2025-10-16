import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
  schema: './src/db/schema.ts',
  // out: './migrations',
  out: './migrations_supa',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DB_CONNECTION_URL!,
  },
  // dialect: 'turso',
  // dbCredentials: {
  //   url: process.env.TURSO_CONNECTION_URL!,
  //   authToken: process.env.TURSO_AUTH_TOKEN!,
  // },
});
