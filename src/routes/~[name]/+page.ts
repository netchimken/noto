import { initAPI } from '$lib/api/client/index.js';
import { AppContextDataSchema } from '$lib/util/app.js';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
  const api = initAPI(fetch);

  const author = await api.author[':id'].$get({ param: { id: '~' + params.name } });
  if (!author.ok) return error(404, 'author not found');

  return {
    ...params,
    author: AppContextDataSchema.shape.author.parse(await author.json())
  }
}