import { defineConfig } from '@prisma/config';
import { env } from 'process';
import 'dotenv/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env.DATABASE_URL,
  },
});
