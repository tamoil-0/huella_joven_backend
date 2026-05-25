import { prisma } from '../lib/prisma';
import { idParamSchema } from '../schemas/common.schema';
import { groupBodySchema, groupMessageSchema } from '../schemas/group.schema';
import { asyncHandler } from '../utils/async-handler';

export const listGroups = asyncHandler(async (_req, res) => {
  const groups = await prisma.youthGroup.findMany({
    include: {
      _count: { select: { members: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: { user: { select: { name: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    groups: groups.map((group) => ({
      ...group,
      members: group._count.members
    }))
  });
});

export const createGroup = asyncHandler(async (req, res) => {
  const data = groupBodySchema.parse(req.body);

  const group = await prisma.$transaction(async (tx) => {
    const created = await tx.youthGroup.create({ data });
    await tx.groupMember.create({
      data: { groupId: created.id, userId: req.user!.id }
    });
    await tx.groupMessage.create({
      data: {
        groupId: created.id,
        userId: req.user!.id,
        body: 'Grupo creado.'
      }
    });
    return created;
  });

  res.status(201).json({ group });
});

export const getGroup = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const group = await prisma.youthGroup.findUniqueOrThrow({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, district: true } } } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true } } }
      }
    }
  });

  res.json({ group });
});

export const joinGroup = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const member = await prisma.groupMember.create({
    data: { groupId: id, userId: req.user!.id }
  });

  res.status(201).json({ member });
});

export const leaveGroup = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId: id, userId: req.user!.id } }
  });

  res.status(204).send();
});

export const addGroupMessage = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = groupMessageSchema.parse(req.body);

  await prisma.groupMember.findUniqueOrThrow({
    where: { groupId_userId: { groupId: id, userId: req.user!.id } }
  });

  const message = await prisma.groupMessage.create({
    data: {
      groupId: id,
      userId: req.user!.id,
      body: data.body
    },
    include: { user: { select: { id: true, name: true } } }
  });

  res.status(201).json({ message });
});
