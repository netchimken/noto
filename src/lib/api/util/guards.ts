import { createMiddleware } from 'hono/factory';
import { decodeSession, verifySession } from './auth';
import type { Author } from '@prisma/client';
import prisma from '$lib/prisma';
import { getCookie } from 'hono/cookie';

namespace Guards {
  export const Auth = createMiddleware<{
    Variables: {
      author: Author
    }
  }>(async (c, next) => {
    const authorization = getCookie(c, 'noto-token');
    if (!authorization) return c.text("invalid authorization", 401);

    const token = authorization.replace("Bearer ", "");

    try {
      const { id } = decodeSession(token);

      const author = await prisma.author.findUnique({ where: { id } });
      if (!author) return c.text("invalid authorization", 401);

      verifySession(token, author.secret);

      c.set('author', author);

      await next();
    } catch {
      return c.text("invalid authorization");
    }
  });
}

export default Guards