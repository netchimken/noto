import { getContext, setContext } from 'svelte';
import { z } from 'zod';

export const AppContextDataSchema = z.object({
  author: z.object({
    email: z.string().nullable(),
    id: z.coerce.number(),
    name: z.string(),
    pinned: z.coerce.number().nullable(),
    admin: z.boolean().nullable(),
    joinedAt: z.coerce.date(),
  }).nullable()
});

export type AppContextData = z.infer<typeof AppContextDataSchema>;

type AppContext = () => AppContextData;

export function setAppContext<T extends AppContext>(context: T): T {
  return setContext('state', context);
}

export function getApp() {
  return getContext('state') as AppContext
}