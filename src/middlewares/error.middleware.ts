import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { HttpError } from '../utils/http-error';

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Datos invalidos.',
      errors: error.flatten()
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Registro duplicado.' });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Registro no encontrado.' });
    }
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: 'Error interno del servidor.' });
};
