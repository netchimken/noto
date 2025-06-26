import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import Guards from './util/guards';
import prisma from '$lib/prisma';
import { populateNote } from './util/parsers';

const noteBodySchema = z.object({
  content: z.string().trim()
});

const noteQuerySchema = z.object({
  id: z.coerce.number()
});

const Note = new Hono()

  .get('/:id',
    zValidator('param', noteQuerySchema),
    async (c) => {
      const { id } = c.req.valid('param');

      const note = await prisma.note.findUnique({ where: { id } });
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
          content
        }
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
        }
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