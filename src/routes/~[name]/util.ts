import { initAPI } from '$lib/api/client';

export const getPage = async (no: number, author: { id: number } | { name: string }) => {
  const api = initAPI(fetch);

  const res = await api.author[':id'].notes.$get({
    param: {
      id: 'id' in author ? '' + author.id : '~' + author.name
    },
    query: {
      count: '' + 9,
      page: '' + no,
    },
  });

  if (res.ok) {
    const data = await res.json();

    return {
      notes: data.notes,
      pages: data.pages,
    };
  } else return null;
};