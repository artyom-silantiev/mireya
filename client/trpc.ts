import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { TrpcAppRouter } from '!src/app_main';

const trpcClient = createTRPCClient<TrpcAppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

const helloRes = await trpcClient.hello.hello.query('Bob');
console.log(helloRes);

await trpcClient.user.clearUsers.query();

const createdUser1 = await trpcClient.user.createUser.query({
  name: 'Bob',
  email: 'example1@example.com',
});
console.log('createdUser', createdUser1);
const createdUser2 = await trpcClient.user.createUser.query({
  name: 'Bob',
  email: 'example2@example.com',
});
console.log('createdUser', createdUser2);

const user = await trpcClient.user.getUser.query({
  id: createdUser2.id,
});
console.log('user', user);

const users = await trpcClient.user.getUsers.query();
console.log('users', users);
