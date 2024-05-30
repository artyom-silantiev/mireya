import { Hono } from 'hono';

const router = new Hono()
  .get(
    '/hello',
    async (c, next) => {
      // middleware
      console.log('before');
      await next();
      console.log('after');
    },
    (c) => {
      return c.json({
        message: 'hello!',
      });
    },
  )
  .get('/ping', (c) => {
    return c.json('pong');
  });

export const ExamplePack = {
  honoRouter: router,
};
