import type { Author, Note } from "@prisma/client";
import z from "zod";

export const NameRegex = /^([A-Za-z0-9]+)$/;

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

export function populateNote(note: Note) {
  return {
    ...note,
    title: note.content.match(/^(#[ \S]+)/)?.at(0)?.replace('# ', '') ?? null
  }
}