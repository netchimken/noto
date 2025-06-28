import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import Guards from './util/guards';
import prisma from '$lib/prisma';
import { cleanAuthor, populateNote } from './util/parsers';


const listNotesSchema = z.object({
  authorId: z.coerce.number().optional(),
  authorName: z.string().optional(),
  noteId: z.coerce.number().optional(),
  orderBy: z.enum(['asc', 'desc']).optional(),
  tags: z.array(z.string()).optional(),
  count: z.coerce.number().min(1).max(50).default(25),
  page: z.coerce.number().positive().default(1),
});

const noteBodySchema = z.object({
  content: z.string().trim()
});

const noteQuerySchema = z.object({
  id: z.coerce.number()
});

const Note = new Hono()

  .get('/list',
    zValidator('query', listNotesSchema),
    async (c) => {
      const {
        authorId,
        authorName,
        noteId,
        orderBy,
        tags,
        count,
        page
      } = c.req.valid('query');

      const availableNoteCount = await prisma.note.count({
        where: {
          author: {
            id: authorId,
            name: authorName
          },
          tags: tags ? { hasEvery: tags } : tags
        },
        orderBy: { id: orderBy ?? "desc" },
        cursor: noteId
          ? {
            id: noteId + (orderBy === 'asc' ? 1 : -1)
          }
          : undefined
      });

      const pages = Math.max(0, Math.ceil(availableNoteCount / count));

      const notes = await prisma.note.findMany({
        where: {
          author: {
            id: authorId,
            name: authorName
          },
          tags: tags ? { hasEvery: tags } : tags
        },
        include: {
          author: {
            select: {
              name: true
            }
          }
        },
        orderBy: { id: orderBy ?? "desc" },
        skip: page > 1
          ? (page <= pages
            ? (page - 1) * count
            : (pages - 1) * count
          )
          : undefined,
        take: count,
        cursor: noteId
          ? {
            id: noteId + (orderBy === 'asc' ? 1 : -1)
          }
          : undefined
      });

      const author = !(authorId || authorName)
        ? null
        : await prisma.author.findUnique({
          where: authorId ? { id: authorId } : { name: authorName }
        });

      const pinned = !author?.pinned
        ? null
        : await prisma.note.findUnique({
          where: { id: author.pinned },
          include: {
            author: {
              select: {
                name: true
              }
            }
          },
        });

      return c.json({
        author: author ? cleanAuthor(author) : null,
        pinned: pinned ? populateNote(pinned) : null,
        notes: notes.map(n => populateNote(n)).filter(n => n.id !== author?.pinned),
        pages: pages
      });
    }
  )

  .get('/:id',
    zValidator('param', noteQuerySchema),
    async (c) => {
      const { id } = c.req.valid('param');

      const note = await prisma.note.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              name: true
            }
          }
        },
      });
      if (!note) return c.text("note not found", 404);

      return c.json(populateNote(note));
    }
  )

  .use(Guards.Auth)

  .post('/create',
    zValidator('json', noteBodySchema),
    async (c) => {
      const { id } = c.get('author');
      const { content } = c.req.valid('json');

      const note = await prisma.note.create({
        data: {
          author: { connect: { id } },
          content,
          tags: content.split(/[\r\n]/).at(-1)?.match(/#[\w-.]+/) ?? []
        },
        include: {
          author: {
            select: {
              name: true
            }
          }
        },
      });

      return c.json(populateNote(note));
    }
  )

  .patch('/:id',
    zValidator('param', noteQuerySchema),
    zValidator('json', noteBodySchema),
    async (c) => {
      const { id: authorId, admin } = c.get('author');
      const { id: noteId } = c.req.valid('param');
      const { content } = c.req.valid('json');

      const note = await prisma.note.findUnique({ where: { id: noteId } });
      if (!note) return c.text("note not found", 404);
      if (!admin && note.authorId !== authorId) return c.text("you are not the author of this note", 401);

      const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: {
          content,
          updatedAt: new Date()
        },
        include: {
          author: {
            select: {
              name: true
            }
          }
        },
      });

      return c.json(populateNote(updatedNote));
    }
  )

  .delete('/:id',
    zValidator('param', noteQuerySchema),
    async (c) => {
      const { id: authorId, admin } = c.get('author');
      const { id: noteId } = c.req.valid('param');

      const note = await prisma.note.findUnique({ where: { id: noteId } });
      if (!note) return c.text("note not found", 404);
      if (!admin && note.authorId !== authorId) return c.text("you are not the author of this note", 401);

      await prisma.note.delete({ where: { id: noteId } });

      return c.text("deleted note " + noteId);
    }
  )

export default Note;