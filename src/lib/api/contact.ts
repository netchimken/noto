import { env } from '$env/dynamic/private';
import { Hono } from 'hono';

const Contact = new Hono()

  .get('/', (c) => {
    return c.json({
      email: env.CONTACT_EMAIL || null
    });
  })

export default Contact;