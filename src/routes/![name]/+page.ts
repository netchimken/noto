import { initAPI } from '$lib/api/client/index.js';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
  const { name } = params;
  const api = initAPI(fetch);

  const authorRes = await api.author[':id'].$get({ param: { id: '~' + name } });
  if (!authorRes.ok) error(404, "author not found");

  const author = await authorRes.json();

  if (!author.pinned) return redirect(307, '/~' + name);
  else return redirect(307, '/' + author.pinned)
}