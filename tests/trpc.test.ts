import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from '@trpc/client';
import type { TrpcAppRouter } from '~/entry';
import { test, beforeAll, afterAll } from 'bun:test';
import * as fse from 'fs-extra';

const NODE_PORT = '3000';
const url = `http://localhost:${NODE_PORT}/trpc`;
function createTrcpClient(token?: string) {
  const headers = token
    ? {
        authorization: `Bearer ${token}`,
      }
    : undefined;

  const trpcClient = createTRPCClient<TrpcAppRouter>({
    links: [
      splitLink({
        condition: (op) => isNonJsonSerializable(op.input),
        true: httpLink({
          url,
          headers,
        }),
        false: httpBatchLink({
          url,
          headers,
        }),
      }),
    ],
  });

  return trpcClient;
}

await Bun.sleep(1000);
const trpcClient = createTrcpClient();

beforeAll(async () => {
  console.log();
});

test('hello bob', async () => {
  const helloRes = await trpcClient.example.hello.query('Bob');
  console.log(helloRes);
});

test('hello uploadFile', async () => {
  const fileData = await fse.readFile(__filename);
  const blob = new Blob([fileData]);
  const file = new File([blob], 'trpc.test.ts') as File;

  const formData = new FormData();
  formData.set('title', 'trpc.test.ts');
  formData.set('file', file);

  const uploadFileRes = await trpcClient.example.uploadFile.mutate(formData);

  console.log(uploadFileRes);
});

test('clear users', async () => {
  await trpcClient.example.clearUsers.query();
});

let createdUser1 = null as null | any;
test('create user', async () => {
  createdUser1 = await trpcClient.example.createUser.mutate({
    name: 'Bob',
    email: 'example1@example.com',
    password: 'bob_password_1',
  });
  console.log('createdUser', createdUser1, '\n');
});

let authToken = '';
test('user login', async () => {
  const loginResult = await trpcClient.guest.userLogin.mutate({
    email: 'example1@example.com',
    password: 'bob_password_1',
  });
  authToken = loginResult.token;
  console.log('loginResult', loginResult, '\n');
});

test('try bad login', async () => {
  try {
    await trpcClient.guest.userLogin.mutate({
      email: 'example1@example.com',
      password: 'not_bob_password',
    });
  } catch (error) {
    console.log(error, '\n');
  }
});

test('try not found user login', async () => {
  try {
    await trpcClient.guest.userLogin.mutate({
      email: 'not_found_bob@example.com',
      password: 'not_bob_password',
    });
  } catch (error) {
    console.log(error, '\n');
  }
});

test('get user private data', async () => {
  const authedTrcpClient = createTrcpClient(authToken);
  const userPrivateDataRes = await authedTrcpClient.user.getInfo.query();
  console.log('userPrivateDataRes', userPrivateDataRes);
});

test('try get user private data', async () => {
  try {
    await trpcClient.user.getInfo.query();
  } catch (err) {
    console.log('err', err);
  }
});

test('get user', async () => {
  const user = await trpcClient.example.getUser.query({
    id: createdUser1.id,
  });
  console.log('user', user, '\n');
});

test('get users', async () => {
  const users = await trpcClient.example.getUsers.query();
  console.log('users', users, '\n');
});

test('delete user', async () => {
  const deleteUserMsg = await trpcClient.example.deleteUser.mutate({
    id: createdUser1.id,
  });
  console.log('deleteUserMsg', deleteUserMsg, '\n');
});

test('delete user again', async () => {
  try {
    const deleteUserMsg = await trpcClient.example.deleteUser.mutate({
      id: createdUser1.id,
    });
    console.log('deleteUserMsg', deleteUserMsg, '\n');
  } catch (error) {
    console.log(error, '\n');
  }
});

afterAll(async () => {});
