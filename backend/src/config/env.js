import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/flowops'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default('supersecretjwtkey_please_change_in_production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('Invalid environment variables:', envParsed.error.format());
  process.exit(1);
}

export const env = envParsed.data;
