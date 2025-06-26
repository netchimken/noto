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