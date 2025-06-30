import { initAPI } from '$lib/api/client/index.js';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
  const api = initAPI(fetch);

  const count = 9;

  const res = await api.note.list.$post({ json: { count, tags: [['hasEvery', [params.tag]]] } });
  if (!res.ok) return error(res.status, res.statusText);

  const notes = await res.json();

  return {
    ...params,
    page: {
      notes: notes.notes,
      pages: notes.pages
    },
    count
  }
}