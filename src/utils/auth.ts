import jwt from 'jsonwebtoken';
import type { User, UserType } from '@prisma/client';

import { env } from '../config/env';

export type JwtUser = {
  id: string;
  email: string;
  type: UserType;
};

export const signToken = (user: Pick<User, 'id' | 'email' | 'type'>) => {
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  };

  return jwt.sign(
    { id: user.id, email: user.email, type: user.type },
    env.JWT_SECRET,
    options
  );
};

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as JwtUser;

export const publicUser = (user: Pick<User, 'id' | 'name' | 'email' | 'district' | 'type' | 'diagnosticDone' | 'createdAt'>) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  district: user.district,
  type: user.type,
  diagnosticDone: user.diagnosticDone,
  createdAt: user.createdAt
});
