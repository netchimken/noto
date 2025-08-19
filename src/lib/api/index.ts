import { Hono } from 'hono';
import Contact from './contact';
import Auth from './auth';
import Author from './author';
import Note from './note';

const router = new Hono()

  .get('ping', (c) => {
    return c.json({
      message: "pong!"
    });
  })

  .route('/contact', Contact)
  .route('/auth', Auth)
  .route('/author', Author)
  .route('/note', Note)

export const api = new Hono().route('/api', router);

export type API = typeof router;