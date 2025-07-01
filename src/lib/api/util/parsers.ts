import type { Author, Note, Prisma } from "@prisma/client";
import z from "zod";

export const NameRegex = /^([\w]+)$/;

const ClientAuthorSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  pinned: z.number().nullable(),
  admin: z.boolean().nullable(),
  joinedAt: z.date(),
});

export type ClientAuthor = z.infer<typeof ClientAuthorSchema>;

export function toClientAuthor(author: Author) {
  return ClientAuthorSchema.parse(author);
}

export interface ClientNote {
  id: number

  title: string | null
  content: string
  tags: string[]

  createdAt: string
  updatedAt?: string | null

  author: {
    id: number
    name: string
  }
}

export const clientNoteInclude = z.object({
  title: z.boolean().optional(),
  content: z.boolean().optional(),
  tags: z.boolean().optional(),

  updatedAt: z.boolean().optional(),

  author: z.boolean().or(z.object({
    id: z.boolean(),
    name: z.boolean(),
  })).optional()
}).optional();

type ClientNoteInclude = z.infer<typeof clientNoteInclude>;

export function toClientNote(
  note: Prisma.NoteGetPayload<{ include: { author: { select: { name: true } } } }>,
) {
  return {
    id: note.id,

    title: note.content.match(/^(#{1,3}(?!#) [^\s][ \S]*)/)?.at(0)?.replace(/#{1,3}/, '') ?? null,
    content: note.content,
    tags: note.tags,

    createdAt: note.createdAt,
    updatedAt: note.updatedAt,

    author: {
      id: note.authorId,
      name: note.author.name
    },
  }
}

export function filterClientNote(
  note: ReturnType<typeof toClientNote>
) {
  return {
    id: note.id,

    title: note.content.match(/^(#{1,3}(?!#) [^\s][ \S]*)/)?.at(0)?.replace(/#{1,3}/, '') ?? null,
    tags: note.tags,

    createdAt: note.createdAt,
    updatedAt: note.updatedAt,

    author: {
      id: note.author.id,
      name: note.author.name
    },
  }
}

export const TagRegex = /((#[\w-.~]+) )*(#[\w-.~]+)$/g;

export function getTags(content: string) {
  return (content.match(TagRegex)?.at(0)?.replace('#', '').split(' ') ?? []).map(t => t.replace('#', ''));
}