import { initAPI } from '$lib/api/client';

export async function getPage(api: ReturnType<typeof initAPI>, no: number, author: { id: number } | { name: string }) {
  const res = await api.note.list.$get({
    query: {
      ...('id' in author ? { authorId: '' + author.id } : { authorName: author.name }),
      count: '' + 9,
      page: '' + no,
    },
  });

  if (res.ok) return await res.json();
  else return null;
};