import { initAPI } from '$lib/api/client';

export const getPage = async (api: ReturnType<typeof initAPI>, no: number, author: { id: number } | { name: string }) => {
  const res = await api.author[':id'].notes.$get({
    param: {
      id: 'id' in author ? '' + author.id : '~' + author.name
    },
    query: {
      count: '' + 9,
      page: '' + no,
    },
  });

  if (res.ok) return await res.json();
  else return null;
};