import type { NextFunction, Request, Response } from 'express';
import type { UserType } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { verifyToken } from '../utils/auth';
import { HttpError } from '../utils/http-error';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        type: UserType;
      };
    }
  }
}

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (!token) {
      throw new HttpError(401, 'Token requerido.');
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, type: true }
    });

    if (!user) {
      throw new HttpError(401, 'Usuario no encontrado.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, 'Token invalido.'));
  }
};

export const requireRoles =
  (...roles: UserType[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, 'Token requerido.'));
    }

    if (!roles.includes(req.user.type)) {
      return next(new HttpError(403, 'No tienes permisos para esta accion.'));
    }

    return next();
  };
