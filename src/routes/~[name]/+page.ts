import { initAPI } from '$lib/api/client/index.js';
import { AppContextDataSchema } from '$lib/util/app.js';
import { getPage } from '$lib/util/notes.js';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
  const api = initAPI(fetch);

  const page = await getPage(api, 1, { name: params.name });
  if (!page) return error(404, 'author not found');

  return {
    ...params,
    page: {
      notes: page.notes,
      pages: page.pages
    },
    pinned: page.pinned,
    author: AppContextDataSchema.shape.author.parse(page.author),
  }
}