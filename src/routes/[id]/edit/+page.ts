import { initAPI } from "$lib/api/client/index.js";
import { error } from "@sveltejs/kit";

export async function load({ params, fetch }) {
  const { id } = params;
  const api = initAPI(fetch);

  const note = await api.note[":id"].$get({ param: { id } });
  if (!note.ok) error(404, "note not found");

  return {
    id: params.id,
    note: await note.json(),
  };
}
