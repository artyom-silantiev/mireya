import { publicProcedure, router } from '!share/trpc';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import type { ExampleService } from '../example/example.service';
import { zodFormDataOrObject } from '!src/lib_share/utils/trpc';

export function createHelloTrpc(exampleService: ExampleService) {
  return router({
    // hello method
    hello: publicProcedure.input(z.string().nullish()).query((opts) => {
      const name = opts.input;
      return `Hello, ${name ? name : 'user'}!`;
    }),

    // getVer method
    getVersion: publicProcedure.query(() => {
      return '1.0.0';
    }),

    uploadFile: publicProcedure
      .input(
        zodFormDataOrObject({
          title: zfd.text(),
          file: zfd.file(),
        }),
      )
      .mutation(async ({ input }) => {
        const file = input.file;

        console.log('input', input);

        await exampleService.upload(file);

        return {
          message: 'file uploaded',
        };
      }),
  });
}
