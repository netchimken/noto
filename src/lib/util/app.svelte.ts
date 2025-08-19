import { getContext, setContext } from 'svelte';
import { z } from 'zod';

export const AppDataSchema = z.object({
  author: z.object({
    email: z.string().nullable(),
    id: z.coerce.number(),
    name: z.string(),
    pinned: z.coerce.number().nullable(),
    admin: z.boolean().nullable(),
    joinedAt: z.coerce.date(),
  }).nullable(),
  lastPage: z.object({
    pageNo: z.number(),
    lastNoteId: z.number(),
  }).nullable()
});

export type AppData = z.infer<typeof AppDataSchema>;

export const app = $state<AppData>({
  author: null,
  lastPage: null
});