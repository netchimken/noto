import prisma from "$lib/prisma";
import { z } from "zod";
import { env } from "$env/dynamic/private";
import { Hono } from "hono";
import mailer from "nodemailer";
import jwt from "jsonwebtoken";
import { zValidator } from "@hono/zod-validator";
import {
  generateSecret,
  generateValidation,
  getAuthSecret,
  getLoginCode,
} from "./util/auth";
import Guards from "./util/guards";
import { cleanAuthor } from "./util/parsers";
import { setCookie } from 'hono/cookie';

const loginSchema = z.object({
  email: z.string().email(),
});

const verifySchema = z.object({
  validation: z.string(),
  code: z.string().max(6).min(6),
});

const validationSchema = z.object({
  exp: z.number(),
  email: z.string().email(),
  requestedAt: z.number(),
});

const Auth = new Hono()

  .post("/login", zValidator("query", loginSchema), async (c) => {
    const { email } = c.req.valid("query");

    const author = await prisma.author.findUnique({ where: { email } });
    if (!author) return c.text("author doesn't exist", 400);

    const requestedAt = new Date();
    const ttl = env.VALIDATION_TTL ? parseInt(env.VALIDATION_TTL) : 5;

    const validation = generateValidation(email, requestedAt, ttl);
    const code = getLoginCode(author.secret, requestedAt);

    await prisma.author.update({
      where: { id: author.id },
      data: { loginAt: requestedAt },
    });

    if (!env.SMTP_HOST) console.log(author.name + ": " + code);
    else {
      const transporter = mailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT),
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

      await transporter.verify();

      await transporter.sendMail({
        from: env.SMTP_SENDER,
        to: email,
        subject: "Sign in to Noto",
        text:
          `You requested to sign in to Noto as "${author.name}".`
          + `\n\nYour one-time code is: ${code}`
          + `\n\nThis code will expire in ${ttl} minutes.`
      });
    }

    return c.json({ validation, ttl });
  })

  .post("/verify", zValidator("query", verifySchema), async (c) => {
    const { validation, code } = c.req.valid("query");

    try {
      const decoded = jwt.verify(validation, getAuthSecret());
      const { exp, email, requestedAt } = validationSchema.parse(decoded);

      const author = await prisma.author.findUnique({ where: { email } });
      if (!author) return c.text("invalid validation", 401);
      if (!author.loginAt || author.loginAt.getTime() !== requestedAt)
        return c.text("invalid validation", 401);
      if (exp * 1000 < Date.now()) return c.text("invalid validation", 401);

      const checkCode = getLoginCode(author.secret, new Date(requestedAt));
      if (checkCode !== code) return c.text("invalid code", 401);

      const expSeconds = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 * 12;
      const expMilliseconds = expSeconds * 1000;

      const token = jwt.sign(
        {
          exp: expSeconds, // expires in 1 year
          email,
          name: author.name,
          id: author.id,
        },
        getAuthSecret() + author.secret,
      );

      setCookie(c, 'noto-token', token, { expires: new Date(expMilliseconds) });

      return c.json({
        author: cleanAuthor(author),
      });
    } catch {
      return c.text("verification failed", 401);
    }
  })

  /* vv PROTECTED BELOW THIS LINE vv */
  .use(Guards.Auth)

  .delete("/logout", async (c) => {
    const author = c.get("author");

    await prisma.author.update({
      where: { id: author.id },
      data: { secret: generateSecret() },
    });

    return c.text("invalidated all sessions");
  });

export default Auth;
