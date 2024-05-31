import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { TrpcAppRouter } from '!src/app_main';
import { test, beforeAll, afterAll } from 'bun:test';

const NODE_PORT = '3555';
let proc = Bun.spawn(['bun', './src/app_main/index.ts'], {
  stdin: 'pipe',
  env: {
    NODE_PORT,
  },
});
await Bun.sleep(1000);
const trpcClient = createTRPCClient<TrpcAppRouter>({
  links: [
    httpBatchLink({
      url: `http://localhost:${NODE_PORT}/trpc`,
    }),
  ],
});
beforeAll(async () => {
  console.log();
  const ws = new WritableStream({
    write(chunk: Uint8Array) {
      console.log('\x1b[36m', Buffer.from(chunk).toString('utf8'), '\x1b[0m');
    },
  });
  proc.stdout.pipeTo(ws);
});

test('hello bob', async () => {
  const helloRes = await trpcClient.hello.hello.query('Bob');
  console.log(helloRes);
});

test('clear users', async () => {
  await trpcClient.user.clearUsers.query();
});

let createdUser1 = null as null | any;
test('create user', async () => {
  createdUser1 = await trpcClient.user.createUser.query({
    name: 'Bob',
    email: 'example1@example.com',
    password: 'bob_password_1',
  });
  console.log('createdUser', createdUser1, '\n');
});

test('user login', async () => {
  const loginResult = await trpcClient.user.userLogin.query({
    email: 'example1@example.com',
    password: 'bob_password_1',
  });
  console.log('loginResult', loginResult, '\n');
});

test('try bad login', async () => {
  try {
    await trpcClient.user.userLogin.query({
      email: 'example1@example.com',
      password: 'not_bob_password',
    });
  } catch (error) {
    console.log(error, '\n');
  }
});

test('try not found user', async () => {
  try {
    await trpcClient.user.userLogin.query({
      email: 'not_found_bob@example.com',
      password: 'not_bob_password',
    });
  } catch (error) {
    console.log(error, '\n');
  }
});

test('get user', async () => {
  const user = await trpcClient.user.getUser.query({
    id: createdUser1.id,
  });
  console.log('user', user, '\n');
});

test('get users', async () => {
  const users = await trpcClient.user.getUsers.query();
  console.log('users', users, '\n');
});

test('delete user', async () => {
  const deleteUserMsg = await trpcClient.user.deleteUser.query({
    id: createdUser1.id,
  });
  console.log('deleteUserMsg', deleteUserMsg, '\n');
});

test('delete user again', async () => {
  try {
    const deleteUserMsg = await trpcClient.user.deleteUser.query({
      id: createdUser1.id,
    });
    console.log('deleteUserMsg', deleteUserMsg, '\n');
  } catch (error) {
    console.log(error, '\n');
  }
});

afterAll(async () => {
  console.log('\n\n afterAll \n\n');
  proc.kill();
  await Bun.sleep(500);
});
