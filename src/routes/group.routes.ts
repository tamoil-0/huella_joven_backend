import { Router } from 'express';

import {
  addGroupMessage,
  createGroup,
  getGroup,
  joinGroup,
  leaveGroup,
  listGroups
} from '../controllers/group.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const groupRoutes = Router();

groupRoutes.use(requireAuth);
groupRoutes.get('/', listGroups);
groupRoutes.post('/', createGroup);
groupRoutes.get('/:id', getGroup);
groupRoutes.post('/:id/join', joinGroup);
groupRoutes.delete('/:id/join', leaveGroup);
groupRoutes.post('/:id/messages', addGroupMessage);
