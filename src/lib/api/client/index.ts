import type { API } from '$lib/api';
import { hc } from 'hono/client';

// reference: https://dev.to/bop/using-hono-with-sveltekit-full-type-safety-with-rpc-2h7

export type APIClient = ReturnType<typeof hc<API>>;

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