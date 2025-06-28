import { initAPI, type APIClient } from '$lib/api/client/index.js';
import { AppContextDataSchema } from '$lib/util/app.js';
import { error } from '@sveltejs/kit';
import { getPage } from './util.js';

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
    noNotes: !page,
    author: AppContextDataSchema.shape.author.parse(page.author),
  }
}