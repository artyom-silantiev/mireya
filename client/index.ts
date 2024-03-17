import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '~/index';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

const res = await trpc.hello.hello.query('Bob');
console.log(res);
