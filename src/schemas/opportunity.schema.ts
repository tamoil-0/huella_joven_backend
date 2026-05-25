import { z } from 'zod';

export const opportunityBodySchema = z.object({
  title: z.string().min(3).max(160),
  organizer: z.string().min(2).max(160),
  place: z.string().min(2).max(160),
  rubro: z.enum(['ambiente', 'educacion', 'ciudadania', 'digital', 'salud', 'cultura']),
  date: z.coerce.date(),
  spots: z.coerce.number().int().positive().max(100000),
  description: z.string().min(5).max(2000),
  roles: z.array(z.string().min(1).max(100)).default([])
});

export const opportunityQuerySchema = z.object({
  rubro: z.enum(['ambiente', 'educacion', 'ciudadania', 'digital', 'salud', 'cultura']).optional()
});

export const enrollmentSchema = z.object({
  role: z.string().max(100).optional()
});
