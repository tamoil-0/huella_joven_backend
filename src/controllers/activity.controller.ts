import { ActivityStatus, UserType } from '@prisma/client';

import { prisma } from '../lib/prisma';
import {
  activityBodySchema,
  activityQuerySchema,
  activityStatusSchema,
  validationSchema
} from '../schemas/activity.schema';
import { idParamSchema } from '../schemas/common.schema';
import { asyncHandler } from '../utils/async-handler';
import { HttpError } from '../utils/http-error';

const canAccessActivity = (activityUserId: string, userId: string, type: UserType) =>
  activityUserId === userId || ['validador', 'admin'].includes(type);

export const listActivities = asyncHandler(async (req, res) => {
  const query = activityQuerySchema.parse(req.query);
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.rubro ? { rubro: query.rubro } : {}),
    ...(query.mine || req.user!.type === 'joven' ? { userId: req.user!.id } : {})
  };

  const activities = await prisma.activity.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, district: true, type: true } },
      validations: { orderBy: { createdAt: 'desc' }, take: 1 }
    },
    orderBy: { date: 'desc' }
  });

  res.json({ activities });
});

export const getActivity = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const activity = await prisma.activity.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, district: true, type: true } },
      validations: { orderBy: { createdAt: 'desc' }, include: { validator: { select: { id: true, name: true } } } }
    }
  });

  if (!canAccessActivity(activity.userId, req.user!.id, req.user!.type)) {
    throw new HttpError(403, 'No puedes ver esta actividad.');
  }

  res.json({ activity });
});

export const createActivity = asyncHandler(async (req, res) => {
  const data = activityBodySchema.parse(req.body);
  const activity = await prisma.activity.create({
    data: {
      ...data,
      userId: req.user!.id
    }
  });

  res.status(201).json({ activity });
});

export const updateActivity = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = activityBodySchema.partial().parse(req.body);
  const current = await prisma.activity.findUniqueOrThrow({ where: { id } });

  if (current.userId !== req.user!.id && req.user!.type !== 'admin') {
    throw new HttpError(403, 'No puedes editar esta actividad.');
  }

  const closedStatuses: ActivityStatus[] = [ActivityStatus.validada, ActivityStatus.rechazada];
  if (closedStatuses.includes(current.status) && req.user!.type !== 'admin') {
    throw new HttpError(409, 'No puedes editar una actividad ya cerrada.');
  }

  const activity = await prisma.activity.update({ where: { id }, data });
  res.json({ activity });
});

export const updateActivityStatus = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { status } = activityStatusSchema.parse(req.body);
  const current = await prisma.activity.findUniqueOrThrow({ where: { id } });

  if (current.userId !== req.user!.id && !['validador', 'admin'].includes(req.user!.type)) {
    throw new HttpError(403, 'No puedes cambiar el estado de esta actividad.');
  }

  const activity = await prisma.activity.update({ where: { id }, data: { status } });
  res.json({ activity });
});

export const validateActivity = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = validationSchema.parse(req.body);

  const activity = await prisma.$transaction(async (tx) => {
    const updated = await tx.activity.update({
      where: { id },
      data: { status: data.status }
    });

    await tx.activityValidation.create({
      data: {
        activityId: id,
        validatorId: req.user!.id,
        status: data.status,
        comment: data.comment
      }
    });

    await tx.notification.create({
      data: {
        userId: updated.userId,
        title: data.status === 'validada' ? 'Actividad validada' : 'Actividad revisada',
        body: data.comment ?? `Tu actividad fue marcada como ${data.status}.`
      }
    });

    return updated;
  });

  res.json({ activity });
});

export const deleteActivity = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const activity = await prisma.activity.findUniqueOrThrow({ where: { id } });

  if (activity.userId !== req.user!.id && req.user!.type !== 'admin') {
    throw new HttpError(403, 'No puedes eliminar esta actividad.');
  }

  await prisma.activity.delete({ where: { id } });
  res.status(204).send();
});

export const impactSummary = asyncHandler(async (req, res) => {
  const [totals, byRubro, validated] = await Promise.all([
    prisma.activity.aggregate({
      where: { userId: req.user!.id, status: 'validada' },
      _sum: { hours: true, beneficiaries: true },
      _count: true
    }),
    prisma.activity.groupBy({
      by: ['rubro'],
      where: { userId: req.user!.id, status: 'validada' },
      _sum: { hours: true, beneficiaries: true },
      _count: true
    }),
    prisma.activity.findMany({
      where: { userId: req.user!.id, status: 'validada' },
      orderBy: { date: 'desc' },
      take: 5
    })
  ]);

  res.json({
    totalHours: totals._sum.hours ?? 0,
    beneficiaries: totals._sum.beneficiaries ?? 0,
    validated: totals._count,
    byRubro,
    recentValidated: validated
  });
});
