import { createMiddleware } from 'hono/factory';
import { decodeSession, verifySession } from './auth';
import type { Author } from '@prisma/client';
import prisma from '$lib/prisma';
import { getCookie } from 'hono/cookie';

namespace Guards {
  export const Auth = createMiddleware<{
    Variables: {
      author: Author,
      token: string
    }
  }>(async (c, next) => {
    const authorization = getCookie(c, 'noto-token') ?? c.req.header('Authorization');
    if (!authorization) return c.text("invalid authorization", 401);

    const token = authorization.replace("Bearer ", "");

    try {
      const session = await prisma.session.findUnique({
        where: { token },
        include: { author: true }
      });
      if (!session) return c.text("invalid authorization", 401);

      verifySession(token);

      c.set('author', session.author);
      c.set('token', token);

      await next();
    } catch {
      return c.text("invalid authorization");
    }
  });
}

export default Guards