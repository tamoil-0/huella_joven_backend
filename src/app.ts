import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { apiRoutes } from './routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    message: 'Huella Joven API lista.',
    docs: '/api/health'
  });
});

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
