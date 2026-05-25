import { prisma } from '../lib/prisma';
import { idParamSchema } from '../schemas/common.schema';
import { asyncHandler } from '../utils/async-handler';

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ notifications });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const notification = await prisma.notification.update({
    where: { id },
    data: { unread: false }
  });

  res.json({ notification });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.notification.delete({ where: { id } });
  res.status(204).send();
});
