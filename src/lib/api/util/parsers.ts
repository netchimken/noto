import type { Author, Note, Prisma } from "@prisma/client";
import z from "zod";

export const NameRegex = /^([\w]+)$/;

const CleanAuthorSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  pinned: z.number().nullable(),
  admin: z.boolean().nullable(),
  joinedAt: z.date(),
});

export function cleanAuthor(author: Author) {
  return CleanAuthorSchema.parse(author);
}

export function populateNote(note: Prisma.NoteGetPayload<{ include: { author: { select: { name: true } } } }>) {
  return {
    ...note,
    author: {
      name: note.author.name
    },
    title: note.content.match(/^(#{1,3}(?!#) [^\s][ \S]*)/)?.at(0)?.replace(/#{1,3}/, '') ?? null
  }
}