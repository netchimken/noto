import { goto } from '$app/navigation';
import type { API } from '$lib/api';
import { Store } from '$lib/util/store';
import { hc, type ClientResponse } from 'hono/client';

// reference: https://dev.to/bop/using-hono-with-sveltekit-full-type-safety-with-rpc-2h7

let browserClient: ReturnType<typeof hc<API>>;

export const initAPI = (fetch: Window['fetch']) => {
  const isBrowser = typeof window !== 'undefined';
  const origin = isBrowser ? window.location.origin : '';

  if (isBrowser && browserClient) {
    return browserClient;
  }

  const client = hc<API>(origin + '/api', { fetch });

  if (isBrowser) {
    browserClient = client;
  }

  return client;
};


export async function key<T extends Promise<U>, U extends ClientResponse<any, any, any>>(req: T, onError?: (res: U) => void) {
  req.catch(() => console.error("Server didn't respond"));

  const res = await req;

  if (res.status === 401) {
    goto("/login");
    return null;
  }

  if (res.status !== 200) {
    if (onError) onError(res);
    return null;
  }

  return res;
}