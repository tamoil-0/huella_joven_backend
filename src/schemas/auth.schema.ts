import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6).max(72),
  district: z.string().min(2).max(80),
  type: z.enum(['joven', 'validador', 'organizacion', 'admin']).default('joven')
});

export const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});
