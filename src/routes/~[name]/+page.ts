import { initAPI } from '$lib/api/client/index.js';
import { getPage } from '$lib/util/notes.js';
import { error } from '@sveltejs/kit';

export async function load({ params, url, fetch }) {
  const api = initAPI(fetch);

  const page = await getPage(api, {
    authorName: params.name,
    tags: url.searchParams.has('hidden')
      ? undefined
      : [
        ['equals', null],
        ['equals', []],
        ['hasEvery', ['~me']]
      ]
  });
  if (!page) return error(404, 'author not found');

  return {
    ...params,
    page,
  }
}