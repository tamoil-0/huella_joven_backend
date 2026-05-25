import { Router } from 'express';

import {
  completeDiagnostic,
  login,
  me,
  register
} from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/me', requireAuth, me);
authRoutes.patch('/diagnostic', requireAuth, completeDiagnostic);
