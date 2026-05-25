import { Router } from 'express';

import {
  cancelEnrollment,
  createOpportunity,
  deleteOpportunity,
  enrollOpportunity,
  getOpportunity,
  listOpportunities,
  myEnrollments,
  updateOpportunity
} from '../controllers/opportunity.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const opportunityRoutes = Router();

opportunityRoutes.get('/', listOpportunities);
opportunityRoutes.get('/mine/enrollments', requireAuth, myEnrollments);
opportunityRoutes.post('/', requireAuth, requireRoles('organizacion', 'admin'), createOpportunity);
opportunityRoutes.get('/:id', getOpportunity);
opportunityRoutes.patch('/:id', requireAuth, requireRoles('organizacion', 'admin'), updateOpportunity);
opportunityRoutes.delete('/:id', requireAuth, requireRoles('organizacion', 'admin'), deleteOpportunity);
opportunityRoutes.post('/:id/enroll', requireAuth, enrollOpportunity);
opportunityRoutes.delete('/:id/enroll', requireAuth, cancelEnrollment);
