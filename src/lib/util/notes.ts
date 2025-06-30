import { initAPI, type APIClient } from '$lib/api/client';
import type { InferRequestType } from 'hono';

export async function getPage(api: ReturnType<typeof initAPI>, options: InferRequestType<APIClient['note']['list']['$post']>['json']) {
  const res = await api.note.list.$post({
    json: {
      count: 9,
      ...options
    },
  });

  if (res.ok) return await res.json();
  else return null;
};