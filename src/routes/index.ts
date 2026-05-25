import { Router } from 'express';

import { activityRoutes } from './activity.routes';
import { authRoutes } from './auth.routes';
import { groupRoutes } from './group.routes';
import { notificationRoutes } from './notification.routes';
import { opportunityRoutes } from './opportunity.routes';

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

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/activities', activityRoutes);
apiRoutes.use('/opportunities', opportunityRoutes);
apiRoutes.use('/groups', groupRoutes);
apiRoutes.use('/notifications', notificationRoutes);
