import { z } from 'zod';
import { publicProcedure, router } from '~/trpc';

const trpcRouter = router({
  // hello method
  hello: publicProcedure.input(z.string().nullish()).query((opts) => {
    const name = opts.input;
    return `Hello, ${name ? name : 'user'}!`;
  }),

  // getVer method
  getVersion: publicProcedure.query(() => {
    return '1.0.0';
  }),
});

export const HelloModule = {
  trpcRouter,
};
