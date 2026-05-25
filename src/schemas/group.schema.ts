import { z } from 'zod';

export const groupBodySchema = z.object({
  name: z.string().min(2).max(140),
  district: z.string().min(2).max(80),
  purpose: z.string().min(5).max(1000)
});

export const groupMessageSchema = z.object({
  body: z.string().min(1).max(1000)
});
