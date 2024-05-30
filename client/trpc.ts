import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { TrpcAppRouter } from '!src/app_main/index';

const trpc = createTRPCClient<TrpcAppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

const helloRes = await trpc.hello.hello.query('Bob');
console.log(helloRes);

await trpc.user.clearUsers.query();

const createdUser1 = await trpc.user.createUser.query({
  name: 'Bob',
  email: 'example1@example.com',
});
console.log('createdUser', createdUser1);
const createdUser2 = await trpc.user.createUser.query({
  name: 'Bob',
  email: 'example2@example.com',
});
console.log('createdUser', createdUser2);

const user = await trpc.user.getUser.query({
  id: createdUser2.id,
});
console.log('user', user);

const users = await trpc.user.getUsers.query();
console.log('users', users);

try {
  await trpc.user.getUser.query({
    id: 100404,
  });
} catch (error) {
  // console.log('error', error);
}
