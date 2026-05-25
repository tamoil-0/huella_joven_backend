import { Router } from 'express';

import {
  deleteNotification,
  listNotifications,
  markNotificationRead
} from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);
notificationRoutes.get('/', listNotifications);
notificationRoutes.patch('/:id/read', markNotificationRead);
notificationRoutes.delete('/:id', deleteNotification);
