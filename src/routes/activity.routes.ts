import { Router } from 'express';

import {
  createActivity,
  deleteActivity,
  getActivity,
  impactSummary,
  listActivities,
  updateActivity,
  updateActivityStatus,
  validateActivity
} from '../controllers/activity.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const activityRoutes = Router();

activityRoutes.use(requireAuth);
activityRoutes.get('/impact/summary', impactSummary);
activityRoutes.get('/', listActivities);
activityRoutes.post('/', createActivity);
activityRoutes.get('/:id', getActivity);
activityRoutes.patch('/:id', updateActivity);
activityRoutes.patch('/:id/status', updateActivityStatus);
activityRoutes.post('/:id/validate', requireRoles('validador', 'admin'), validateActivity);
activityRoutes.delete('/:id', deleteActivity);
