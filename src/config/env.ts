import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const rawEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL ?? process.env.POSTGRES_URL,
  JWT_SECRET:
    process.env.JWT_SECRET ??
    'huella-joven-local-development-secret'
};

const envSchema = z.object({
  DATABASE_URL: z.string().default(''),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.string().default('development')
});

export const env = envSchema.parse(rawEnv);
