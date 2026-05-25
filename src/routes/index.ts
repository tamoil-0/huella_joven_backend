import { Router } from 'express';

import { activityRoutes } from './activity.routes';
import { authRoutes } from './auth.routes';
import { groupRoutes } from './group.routes';
import { notificationRoutes } from './notification.routes';
import { opportunityRoutes } from './opportunity.routes';
import { prisma } from '../lib/prisma';

export const apiRoutes = Router();

apiRoutes.get('/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'Huella Joven API',
    timestamp: new Date().toISOString(),
    env: {
      database: Boolean(process.env.DATABASE_URL ?? process.env.POSTGRES_URL),
      jwt: Boolean(process.env.JWT_SECRET)
    }
  });
});

apiRoutes.get('/db-check', async (_req, res, next) => {
  try {
    const started = Date.now();
    const users = await Promise.race([
      prisma.user.count(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB_TIMEOUT')), 8000),
      )
    ]);

    res.json({
      ok: true,
      users,
      elapsedMs: Date.now() - started,
      databaseUrlKind: process.env.POSTGRES_PRISMA_URL
        ? 'POSTGRES_PRISMA_URL'
        : process.env.DATABASE_URL
          ? 'DATABASE_URL'
          : 'missing'
    });
  } catch (error) {
    next(error);
  }
});

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/activities', activityRoutes);
apiRoutes.use('/opportunities', opportunityRoutes);
apiRoutes.use('/groups', groupRoutes);
apiRoutes.use('/notifications', notificationRoutes);
