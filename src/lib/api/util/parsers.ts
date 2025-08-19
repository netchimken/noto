import type { Lazy } from '$lib/util/helpers';
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

export type SimpleClientNote = Omit<ClientNote, 'content'>;

export function toSimpleClientNote(
  note: Lazy<Prisma.NoteGetPayload<{ include: { author: { select: { name: true } } } }>, 'content'>,
) {
  return {
    id: note.id,

    title: note.title,
    tags: note.tags,

    createdAt: note.createdAt,
    updatedAt: note.updatedAt,

    author: {
      id: note.authorId,
      name: note.author.name
    },
  }
}

export function toClientNote(
  note: Prisma.NoteGetPayload<{ include: { author: { select: { name: true } } } }>,
) {
  return {
    id: note.id,

    title: note.title,
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

    title: note.content?.match(/^(#{1,3}(?!#) [^\s][ \S]*)/)?.at(0)?.replace(/#{1,3}/, '') ?? null,
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

export function getTitle(content: string) {
  return content.match(/^(#{1,3}(?!#) [^\s][ \S]*)/)?.at(0)?.replace(/#{1,3}/, '') ?? undefined;
}