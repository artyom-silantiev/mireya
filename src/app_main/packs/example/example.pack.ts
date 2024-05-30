import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

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
  })
  .post(
    '/upload',
    zValidator(
      'form',
      z.object({
        data: z.string(),
        file: z.custom<File>((val) => val instanceof File),
      }),
    ),
    async (c) => {
      const body = await c.req.parseBody();
      const file = body['file'] as File;
      const webRs = file.stream();
      const rs = Readable.fromWeb(webRs);
      const ws = createWriteStream(join(process.cwd(), 'work', file.name));
      rs.pipe(ws);

      return c.json({
        message: 'file loaded',
      });
    },
  );

export const ExamplePack = {
  honoRouter: router,
};
