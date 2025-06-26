import { env } from '$env/dynamic/private';

export async function handle({ event, resolve }) {
	if (event.url.pathname.startsWith('/api/auth')) {
		if (!env.AUTH_SECRET) throw new Error("Environment variable 'AUTH_SECRET' not found");
	}

	const response = await resolve(event);
	return response;
}