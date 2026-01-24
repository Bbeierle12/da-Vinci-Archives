import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use unpooled connection for migrations
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
