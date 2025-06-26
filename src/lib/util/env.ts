import { env } from '$env/dynamic/public';
import { z } from 'zod';

const envSchema = z.object({
  PUBLIC_BRAND: z.string().default('noto'),
  PUBLIC_ALLOW_XSS: z.coerce.boolean().optional()
});

type Env = z.infer<typeof envSchema>;

export const clientEnv = envSchema.parse({
  PUBLIC_BRAND: env.PUBLIC_BRAND,
  PUBLIC_ALLOW_XSS: env.PUBLIC_ALLOW_XSS
})