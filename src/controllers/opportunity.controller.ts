import { prisma } from '../lib/prisma';
import { idParamSchema } from '../schemas/common.schema';
import {
  enrollmentSchema,
  opportunityBodySchema,
  opportunityQuerySchema
} from '../schemas/opportunity.schema';
import { asyncHandler } from '../utils/async-handler';
import { HttpError } from '../utils/http-error';

export const listOpportunities = asyncHandler(async (req, res) => {
  const query = opportunityQuerySchema.parse(req.query);
  const opportunities = await prisma.opportunity.findMany({
    where: query.rubro ? { rubro: query.rubro } : {},
    include: {
      enrollments: req.user
        ? { where: { userId: req.user.id }, select: { id: true, role: true } }
        : false
    },
    orderBy: { date: 'asc' }
  });

  res.json({ opportunities });
});

export const getOpportunity = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const opportunity = await prisma.opportunity.findUniqueOrThrow({
    where: { id },
    include: {
      enrollments: {
        select: {
          id: true,
          role: true,
          user: { select: { id: true, name: true, district: true } }
        }
      }
    }
  });

  res.json({ opportunity });
});

export const createOpportunity = asyncHandler(async (req, res) => {
  const data = opportunityBodySchema.parse(req.body);
  const opportunity = await prisma.opportunity.create({
    data: {
      ...data,
      creatorId: req.user!.id
    }
  });

  res.status(201).json({ opportunity });
});

export const updateOpportunity = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = opportunityBodySchema.partial().parse(req.body);
  const opportunity = await prisma.opportunity.update({ where: { id }, data });

  res.json({ opportunity });
});

export const deleteOpportunity = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.opportunity.delete({ where: { id } });
  res.status(204).send();
});

export const enrollOpportunity = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = enrollmentSchema.parse(req.body);

  const result = await prisma.$transaction(async (tx) => {
    const opportunity = await tx.opportunity.findUniqueOrThrow({
      where: { id },
      include: { _count: { select: { enrollments: true } } }
    });

    if (opportunity._count.enrollments >= opportunity.spots) {
      throw new HttpError(409, 'La oportunidad ya no tiene cupos.');
    }

    const enrollment = await tx.opportunityEnrollment.create({
      data: {
        opportunityId: id,
        userId: req.user!.id,
        role: data.role
      }
    });

    const taken = opportunity._count.enrollments + 1;
    await tx.opportunity.update({
      where: { id },
      data: { taken }
    });

    return { enrollment, taken };
  });

  res.status(201).json(result);
});

export const cancelEnrollment = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);

  await prisma.$transaction(async (tx) => {
    await tx.opportunityEnrollment.delete({
      where: { opportunityId_userId: { opportunityId: id, userId: req.user!.id } }
    });

    const count = await tx.opportunityEnrollment.count({ where: { opportunityId: id } });
    await tx.opportunity.update({ where: { id }, data: { taken: count } });
  });

  res.status(204).send();
});

export const myEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await prisma.opportunityEnrollment.findMany({
    where: { userId: req.user!.id },
    include: { opportunity: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ enrollments });
});
