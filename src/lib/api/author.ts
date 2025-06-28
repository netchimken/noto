import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import Guards from "./util/guards";
import prisma from "$lib/prisma";
import { generateSecret } from "./util/auth";
import { cleanAuthor, NameRegex, populateNote } from "./util/parsers";

const idSchema = z.object({
  id: z.string()
});

const createSchema = z.object({
  name: z.string().regex(NameRegex),
  email: z.string().email(),
});

const nameSchema = z.object({
  name: z.string().regex(NameRegex),
});

const notesSchema = z
  .object({
    count: z.coerce.number().default(25),
    page: z.coerce.number().positive().default(1),
  });

const Author = new Hono()

  .route('/me', new Hono()
    .use(Guards.Auth)

    .get("/", async (c) => {
      const author = c.get("author");
      return c.json(cleanAuthor(author));
    })

    .patch("/name",
      zValidator("query", nameSchema),
      async (c) => {
        const { id, name: oldName } = c.get("author");
        const { name } = c.req.valid("query");

        const author = await prisma.author.update({
          where: { id },
          data: { name },
        });

        return c.text(`updated name: '${oldName}' -> '${author.name}'`);
      }
    )

    .patch("/pinned",
      zValidator("query", z.object({
        id: z.string().optional().transform(s => s ? +s : null).pipe(z.number().nullable())
      })),
      async (c) => {
        const { id: authorId, pinned } = c.get("author");
        const { id: noteId } = c.req.valid("query");

        await prisma.author.update({
          where: { id: authorId },
          data: { pinned: noteId }
        });

        return c.text(`changed pin from '${pinned ?? 'none'}' to '${noteId ?? 'none'}'`);
      }
    )
  )

  .post("/create",
    Guards.Auth,
    zValidator("query", createSchema),
    async (c) => {
      const { admin } = c.get("author");
      if (!admin) return c.text("this is a protected route", 401);

      const { name, email } = c.req.valid("query");

      const authorExists = await prisma.author.findFirst({
        where: {
          OR: [{ name }, { email }],
        },
      });
      if (authorExists)
        return c.text(
          `author already exists: ${authorExists.name} <${authorExists.email}>`,
          409,
        );

      const author = await prisma.author.create({
        data: {
          name,
          email,
          secret: generateSecret(),
        },
      });

      return c.json(cleanAuthor(author));
    }
  )

  .get('/:id',
    zValidator('param', idSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const name = id.startsWith('~') ? id.substring(1) : null;

      const author = await prisma.author.findUnique({
        where: name ? { name } : { id: +id }
      });
      if (!author) return c.text('author not found', 404);

      return c.json(cleanAuthor(author));
    }
  )

  .get("/:id/notes",
    zValidator('param', idSchema),
    zValidator("query", notesSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const name = id.startsWith('~') ? id.substring(1) : null;

      const { count, page } = c.req.valid("query");

      const availableNoteCount = await prisma.note.count({
        where: name ? { authorName: name } : { authorId: +id }
      });
      if (availableNoteCount === 0) return c.text("author has no notes", 404)

      const pages = Math.ceil(availableNoteCount / count);

      const author = await prisma.author.findUnique({
        where: name ? { name } : { id: +id },
        include: {
          notes: {
            orderBy: { id: "desc" },
            skip: (page > 0 && page <= pages)
              ? (page - 1) * count
              : (pages - 1) * count,
            take: count,
          },
        },
      });
      if (!author) return c.text("author not found", 404);

      const pinned =
        !author.pinned
          ? null
          : await prisma.note.findUnique({ where: { id: author.pinned } });

      return c.json({
        author: cleanAuthor(author),
        notes: author.notes.map(n => populateNote(n)),
        pinned: pinned ? populateNote(pinned) : null,
        pages: pages
      });
    }
  );

export default Author;
