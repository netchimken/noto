import { Hono } from 'hono';
import Contact from './contact';
import Auth from './auth';
import Author from './author';
import Note from './note';

const router = new Hono()

  .get('hello', (c) => {
    return c.json({
      message: "Oh yeah"
    });
  })

  .route('/contact', Contact)
  .route('/auth', Auth)
  .route('/author', Author)
  .route('/note', Note)

export const api = new Hono().route('/api', router);

export type API = typeof router;