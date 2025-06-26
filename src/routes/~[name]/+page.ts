import { initAPI } from '$lib/api/client/index.js';
import { AppContextDataSchema } from '$lib/util/app.js';
import { error } from '@sveltejs/kit';
import { getPage } from './util.js';

export async function load({ params, fetch }) {
  const api = initAPI(fetch);

  const res = await api.author[':id'].$get({ param: { id: '~' + params.name } });
  if (!res.ok) return error(404, 'author not found');

  const author = await res.json();

  return {
    ...params,
    page: await getPage(1, { id: author.id }),
    author: AppContextDataSchema.shape.author.parse(author)
  }
}