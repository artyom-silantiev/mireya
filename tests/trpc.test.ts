import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from '@trpc/client';
import type { TrpcAppRouter } from '!src/app_main';
import { test, beforeAll, afterAll } from 'bun:test';
import * as fse from 'fs-extra';

const NODE_PORT = '3555';
let proc = Bun.spawn(['bun', './src/app_main/index.ts'], {
  stdin: 'pipe',
  env: {
    NODE_PORT,
  },
});

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

test('hello uploadFile', async () => {
  const fileData = await fse.readFile(__filename);
  const blob = new Blob([fileData]);
  const file = new File([blob], 'trpc.test.ts') as File;

  const formData = new FormData();
  formData.set('title', 'trpc.test.ts');
  formData.set('file', file);

  const uploadFileRes = await trpcClient.hello.uploadFile.mutate(formData);

  console.log(uploadFileRes);
});

test('clear users', async () => {
  await trpcClient.user.clearUsers.query();
});

let createdUser1 = null as null | any;
test('create user', async () => {
  createdUser1 = await trpcClient.user.createUser.mutate({
    name: 'Bob',
    email: 'example1@example.com',
    password: 'bob_password_1',
  });
  console.log('createdUser', createdUser1, '\n');
});

let authToken = '';
test('user login', async () => {
  const loginResult = await trpcClient.user.userLogin.mutate({
    email: 'example1@example.com',
    password: 'bob_password_1',
  });
  authToken = loginResult.token;
  console.log('loginResult', loginResult, '\n');
});

test('get user private data', async () => {
  const authedTrcpClient = createTrcpClient(authToken);
  const userPrivateDataRes =
    await authedTrcpClient.user.getUserPrivateData.query();
  console.log('userPrivateDataRes', userPrivateDataRes);
});

test('try get user private data', async () => {
  try {
    await trpcClient.user.getUserPrivateData.query();
  } catch (err) {
    console.log('err', err);
  }
});

test('try bad login', async () => {
  try {
    await trpcClient.user.userLogin.mutate({
      email: 'example1@example.com',
      password: 'not_bob_password',
    });
  } catch (error) {
    console.log(error, '\n');
  }
});

test('try not found user', async () => {
  try {
    await trpcClient.user.userLogin.mutate({
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
  const deleteUserMsg = await trpcClient.user.deleteUser.mutate({
    id: createdUser1.id,
  });
  console.log('deleteUserMsg', deleteUserMsg, '\n');
});

test('delete user again', async () => {
  try {
    const deleteUserMsg = await trpcClient.user.deleteUser.mutate({
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
