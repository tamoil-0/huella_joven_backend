import bcrypt from 'bcryptjs';

import { prisma } from '../lib/prisma';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { publicUser, signToken } from '../utils/auth';
import { HttpError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import { withTimeout } from '../utils/with-timeout';

export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await withTimeout(
    prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        district: data.district,
        type: data.type
      }
    }),
  );

  const token = signToken(user);
  res.status(201).json({ user: publicUser(user), token });
});

export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await withTimeout(
    prisma.user.findUnique({ where: { email: data.email } }),
  );

  if (!user) {
    throw new HttpError(401, 'Credenciales invalidas.');
  }

  const validPassword = await bcrypt.compare(data.password, user.passwordHash);
  if (!validPassword) {
    throw new HttpError(401, 'Credenciales invalidas.');
  }

  const token = signToken(user);
  res.json({ user: publicUser(user), token });
});

export const me = asyncHandler(async (req, res) => {
  const user = await withTimeout(
    prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id }
    }),
  );

  res.json({ user: publicUser(user) });
});

export const completeDiagnostic = asyncHandler(async (req, res) => {
  const user = await withTimeout(
    prisma.user.update({
      where: { id: req.user!.id },
      data: { diagnosticDone: true }
    }),
  );

  res.json({ user: publicUser(user) });
});
