import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ExampleService } from './example.service';
import { Hono } from 'hono';

export function createExampleHono(exampleService: ExampleService) {
  return new Hono()
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
        await exampleService.upload(file);

        return c.json({
          message: 'file loaded',
        });
      },
    );
}
