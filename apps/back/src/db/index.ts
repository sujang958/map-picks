import { config } from 'dotenv';
// import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

config({ path: '.env' }); // or .env.local

export const client = postgres(process.env.SUPABASE_DB_CONNECTION_URL!, { prepare: false })

export const db = drizzle({client, schema})

// export const db = drizzle({
//   // connection: {
//   //   // url: process.env.TURSO_CONNECTION_URL!,
//   //   // authToken: process.env.TURSO_AUTH_TOKEN!,
//   //   url:,
//   // },
  
//   schema,
// });
