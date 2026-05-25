import type { IncomingMessage, ServerResponse } from 'http';
import type serverless from 'serverless-http';
import { handleFastApi } from './fast-api';

type ServerlessHandler = ReturnType<typeof serverless>;

let handler: ServerlessHandler | undefined;

function sendHealth(res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      ok: true,
      name: 'Huella Joven API',
      timestamp: new Date().toISOString(),
      env: {
        database: Boolean(process.env.DATABASE_URL ?? process.env.POSTGRES_URL),
        jwt: Boolean(process.env.JWT_SECRET)
      }
    }),
  );
}

export default async function vercelHandler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  if (req.url?.startsWith('/api/health')) {
    sendHealth(res);
    return;
  }

  if (await handleFastApi(req, res)) {
    return;
  }

  if (!handler) {
    const [{ default: serverlessHttp }, { default: app }] = await Promise.all([
      import('serverless-http'),
      import('../src/app')
    ]);
    handler = serverlessHttp(app);
  }

  return handler(req, res);
}
