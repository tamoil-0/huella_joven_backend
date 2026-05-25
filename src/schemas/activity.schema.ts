import { z } from 'zod';

export const activityBodySchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(5).max(1500),
  date: z.coerce.date(),
  location: z.string().min(2).max(160),
  rubro: z.enum(['ambiente', 'educacion', 'ciudadania', 'digital', 'salud', 'cultura']),
  hours: z.coerce.number().int().positive().max(500),
  beneficiaries: z.coerce.number().int().min(0).max(100000),
  role: z.string().min(2).max(120),
  validator: z.string().min(2).max(160),
  reflection: z.string().min(2).max(1500),
  status: z.enum(['borrador', 'pendiente', 'enviada']).default('pendiente'),
  evidence: z.array(z.string().min(1).max(300)).default([])
});

export const activityQuerySchema = z.object({
  status: z.enum(['borrador', 'pendiente', 'enviada', 'validada', 'observada', 'rechazada']).optional(),
  rubro: z.enum(['ambiente', 'educacion', 'ciudadania', 'digital', 'salud', 'cultura']).optional(),
  mine: z.coerce.boolean().default(false)
});

export const activityStatusSchema = z.object({
  status: z.enum(['borrador', 'pendiente', 'enviada', 'validada', 'observada', 'rechazada'])
});

export const validationSchema = z.object({
  status: z.enum(['validada', 'observada', 'rechazada']),
  comment: z.string().max(1000).optional()
});
