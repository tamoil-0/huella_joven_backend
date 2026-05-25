import { HttpError } from './http-error';

export async function withTimeout<T>(
  promise: Promise<T>,
  milliseconds = 8000,
  message = 'La base de datos tardo demasiado en responder.',
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timer = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new HttpError(504, message));
    }, milliseconds);
  });

  try {
    return await Promise.race([promise, timer]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
