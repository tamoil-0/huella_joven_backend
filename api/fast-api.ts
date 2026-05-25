import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';

type SessionUser = {
  id: string;
  email: string;
  type: string;
};

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';
const sql = neon(connectionString);

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function publicUser(user: Record<string, unknown>) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    district: user.district,
    type: user.type,
    diagnosticDone: user.diagnosticDone ?? user.diagnosticdone ?? false,
    createdAt: user.createdAt ?? user.createdat
  };
}

function signToken(user: SessionUser) {
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn']
  };

  return jwt.sign(
    { id: user.id, email: user.email, type: user.type },
    process.env.JWT_SECRET ?? 'huella-joven-local-development-secret',
    options,
  );
}

function auth(req: IncomingMessage): SessionUser | undefined {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return undefined;

  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET ?? 'huella-joven-local-development-secret',
    ) as SessionUser;
  } catch (_) {
    return undefined;
  }
}

async function body(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function requireUser(req: IncomingMessage, res: ServerResponse) {
  const user = auth(req);
  if (!user) {
    json(res, 401, { message: 'Token requerido.' });
    return;
  }
  return user;
}

export async function handleFastApi(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const method = req.method ?? 'GET';
  const url = new URL(req.url ?? '/', 'https://huella-joven-backend.vercel.app');
  const path = url.pathname;

  try {
    if (method === 'POST' && path === '/api/auth/login') {
      const data = await body(req);
      const rows = await sql`
        SELECT id, name, email, district, type, "diagnosticDone", "createdAt", "passwordHash"
        FROM users
        WHERE email = ${String(data.email ?? '').trim().toLowerCase()}
        LIMIT 1
      `;
      const user = rows[0];
      if (!user || !(await bcrypt.compare(String(data.password ?? ''), user.passwordHash))) {
        json(res, 401, { message: 'Credenciales invalidas.' });
        return true;
      }

      json(res, 200, {
        user: publicUser(user),
        token: signToken({ id: user.id, email: user.email, type: user.type })
      });
      return true;
    }

    if (method === 'GET' && path === '/api/auth/me') {
      const session = requireUser(req, res);
      if (!session) return true;

      const rows = await sql`
        SELECT id, name, email, district, type, "diagnosticDone", "createdAt"
        FROM users
        WHERE id = ${session.id}
        LIMIT 1
      `;
      if (!rows[0]) {
        json(res, 401, { message: 'Usuario no encontrado.' });
        return true;
      }
      json(res, 200, { user: publicUser(rows[0]) });
      return true;
    }

    if (method === 'PATCH' && path === '/api/auth/diagnostic') {
      const session = requireUser(req, res);
      if (!session) return true;
      const rows = await sql`
        UPDATE users
        SET "diagnosticDone" = true, "updatedAt" = NOW()
        WHERE id = ${session.id}
        RETURNING id, name, email, district, type, "diagnosticDone", "createdAt"
      `;
      json(res, 200, { user: publicUser(rows[0]) });
      return true;
    }

    if (method === 'GET' && path === '/api/activities') {
      const session = requireUser(req, res);
      if (!session) return true;
      const mine = url.searchParams.get('mine') !== 'false' || session.type === 'joven';
      const activities = mine
        ? await sql`SELECT * FROM activities WHERE "userId" = ${session.id} ORDER BY date DESC`
        : await sql`SELECT * FROM activities ORDER BY date DESC`;
      json(res, 200, { activities });
      return true;
    }

    if (method === 'POST' && path === '/api/activities') {
      const session = requireUser(req, res);
      if (!session) return true;
      const data = await body(req);
      const rows = await sql`
        INSERT INTO activities (
          id, "userId", title, description, date, location, rubro, hours,
          beneficiaries, role, validator, reflection, status, evidence,
          "createdAt", "updatedAt"
        )
        VALUES (
          ${randomUUID()}, ${session.id}, ${data.title}, ${data.description},
          ${data.date}, ${data.location}, ${data.rubro}, ${Number(data.hours ?? 1)},
          ${Number(data.beneficiaries ?? 0)}, ${data.role}, ${data.validator},
          ${data.reflection}, ${data.status ?? 'pendiente'}, ${data.evidence ?? []},
          NOW(), NOW()
        )
        RETURNING *
      `;
      json(res, 201, { activity: rows[0] });
      return true;
    }

    const validateMatch = path.match(/^\/api\/activities\/([^/]+)\/validate$/);
    if (method === 'POST' && validateMatch) {
      const session = requireUser(req, res);
      if (!session) return true;
      const data = await body(req);
      const activityId = validateMatch[1];
      const updated = await sql`
        UPDATE activities
        SET status = ${data.status}, "updatedAt" = NOW()
        WHERE id = ${activityId}
        RETURNING *
      `;
      if (!updated[0]) {
        json(res, 404, { message: 'Actividad no encontrada.' });
        return true;
      }
      await sql`
        INSERT INTO activity_validations (
          id, "activityId", "validatorId", status, comment, "createdAt"
        )
        VALUES (
          ${randomUUID()}, ${activityId}, ${session.id}, ${data.status},
          ${data.comment ?? null}, NOW()
        )
      `;
      await sql`
        INSERT INTO notifications (id, "userId", title, body, unread, "createdAt")
        VALUES (
          ${randomUUID()}, ${updated[0].userId},
          ${data.status === 'validada' ? 'Actividad validada' : 'Actividad revisada'},
          ${data.comment ?? `Tu actividad fue marcada como ${data.status}.`},
          true, NOW()
        )
      `;
      json(res, 200, { activity: updated[0] });
      return true;
    }

    const deleteActivityMatch = path.match(/^\/api\/activities\/([^/]+)$/);
    if (method === 'DELETE' && deleteActivityMatch) {
      const session = requireUser(req, res);
      if (!session) return true;
      await sql`DELETE FROM activities WHERE id = ${deleteActivityMatch[1]} AND "userId" = ${session.id}`;
      res.statusCode = 204;
      res.end();
      return true;
    }

    if (method === 'GET' && path === '/api/opportunities') {
      const opportunities = await sql`SELECT * FROM opportunities ORDER BY date ASC`;
      json(res, 200, { opportunities });
      return true;
    }

    const enrollMatch = path.match(/^\/api\/opportunities\/([^/]+)\/enroll$/);
    if (method === 'POST' && enrollMatch) {
      const session = requireUser(req, res);
      if (!session) return true;
      const data = await body(req);
      const id = enrollMatch[1];
      const inserted = await sql`
        INSERT INTO opportunity_enrollments (
          id, "opportunityId", "userId", role, "createdAt"
        )
        VALUES (${randomUUID()}, ${id}, ${session.id}, ${data.role ?? null}, NOW())
        ON CONFLICT ("opportunityId", "userId") DO NOTHING
        RETURNING *
      `;
      const count = await sql`
        SELECT COUNT(*)::int AS count FROM opportunity_enrollments
        WHERE "opportunityId" = ${id}
      `;
      await sql`UPDATE opportunities SET taken = ${count[0].count}, "updatedAt" = NOW() WHERE id = ${id}`;
      json(res, 201, { enrollment: inserted[0] ?? null, taken: count[0].count });
      return true;
    }

    if (method === 'GET' && path === '/api/groups') {
      const groups = await sql`
        SELECT
          g.*,
          (SELECT COUNT(*)::int FROM group_members gm WHERE gm."groupId" = g.id) AS members,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'body', msg.body,
                  'createdAt', msg."createdAt",
                  'user', json_build_object('name', u.name)
                )
              )
              FROM (
                SELECT * FROM group_messages
                WHERE "groupId" = g.id
                ORDER BY "createdAt" DESC
                LIMIT 2
              ) msg
              JOIN users u ON u.id = msg."userId"
            ),
            '[]'::json
          ) AS messages
        FROM youth_groups g
        ORDER BY g."createdAt" DESC
      `;
      json(res, 200, { groups });
      return true;
    }

    if (method === 'POST' && path === '/api/groups') {
      const session = requireUser(req, res);
      if (!session) return true;
      const data = await body(req);
      const groupId = randomUUID();
      const groups = await sql`
        INSERT INTO youth_groups (id, name, district, purpose, "createdAt", "updatedAt")
        VALUES (${groupId}, ${data.name}, ${data.district}, ${data.purpose}, NOW(), NOW())
        RETURNING *
      `;
      await sql`
        INSERT INTO group_members (id, "groupId", "userId", "createdAt")
        VALUES (${randomUUID()}, ${groupId}, ${session.id}, NOW())
      `;
      await sql`
        INSERT INTO group_messages (id, "groupId", "userId", body, "createdAt")
        VALUES (${randomUUID()}, ${groupId}, ${session.id}, 'Grupo creado.', NOW())
      `;
      json(res, 201, { group: groups[0] });
      return true;
    }

    const joinMatch = path.match(/^\/api\/groups\/([^/]+)\/join$/);
    if (method === 'POST' && joinMatch) {
      const session = requireUser(req, res);
      if (!session) return true;
      const member = await sql`
        INSERT INTO group_members (id, "groupId", "userId", "createdAt")
        VALUES (${randomUUID()}, ${joinMatch[1]}, ${session.id}, NOW())
        ON CONFLICT ("groupId", "userId") DO NOTHING
        RETURNING *
      `;
      json(res, 201, { member: member[0] ?? null });
      return true;
    }

    if (method === 'GET' && path === '/api/notifications') {
      const session = requireUser(req, res);
      if (!session) return true;
      const notifications = await sql`
        SELECT * FROM notifications
        WHERE "userId" = ${session.id}
        ORDER BY "createdAt" DESC
      `;
      json(res, 200, { notifications });
      return true;
    }

    return false;
  } catch (error) {
    console.error(error);
    json(res, 500, {
      message: error instanceof Error ? error.message : 'Error interno del servidor.'
    });
    return true;
  }
}
