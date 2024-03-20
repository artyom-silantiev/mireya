import { publicProcedure, router } from '!share/trpc';
import { z } from 'zod';

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

export const HelloPack = {
  trpcRouter,
};

const formSchema = z.object({
  file: z.instanceof(File),
});

type X = z.infer<typeof formSchema>;
