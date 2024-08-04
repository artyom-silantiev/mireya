import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from '@trpc/client';
import type { TrpcAppRouter } from '~/entry';
import { test, beforeAll, afterAll, expect } from 'bun:test';
import * as fse from 'fs-extra';
import { verify, sign } from 'hono/jwt';
import { useEnv } from '~/lib/env/env';
import type { JtwAuthPayload } from '~/lib/jwt-auth';

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
  console.log('helloRes', helloRes);
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
  console.log('createdUser', createdUser1);
  expect(createdUser1.email).toBe('example1@example.com');
});

let accessToken = '';
let refreshToken = '';
test('user login', async () => {
  const authRes = await trpcClient.guest.userLogin.mutate({
    email: 'example1@example.com',
    password: 'bob_password_1',
  });
  accessToken = authRes.accessToken;
  refreshToken = authRes.refreshToken;
  console.log('authRes', authRes);
  expect(authRes.message).toBe('ok');
});

test('use refresh', async () => {
  try {
    await trpcClient.guest.useRefreshToken.mutate({
      refreshToken,
    });
  } catch (error) {
    console.log('error', error);
    expect(error).toBeInstanceOf(Error);
  }

  const payload = (await verify(
    refreshToken,
    useEnv().JWT_SECRET_USER_AUTH,
  )) as JtwAuthPayload;
  const modRefreshToken = await sign(
    {
      t: 'R',
      u: payload.u,
      exp: payload.exp - 60 * 60 * 24,
    } as JtwAuthPayload,
    useEnv().JWT_SECRET_USER_AUTH,
  );

  const refreshRes = await trpcClient.guest.useRefreshToken.mutate({
    refreshToken: modRefreshToken,
  });
  accessToken = refreshRes.accessToken;
  refreshToken = refreshRes.refreshToken;
  console.log('refreshRes', refreshRes);
  expect(refreshRes.message).toBe('ok');
});

test('try bad login', async () => {
  try {
    await trpcClient.guest.userLogin.mutate({
      email: 'example1@example.com',
      password: 'not_bob_password',
    });
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});

test('try not found user login', async () => {
  try {
    await trpcClient.guest.userLogin.mutate({
      email: 'not_found_bob@example.com',
      password: 'not_bob_password',
    });
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});

test('get user private data', async () => {
  const authedTrcpClient = createTrcpClient(accessToken);
  const userPrivateDataRes = await authedTrcpClient.user.getInfo.query();
  expect(userPrivateDataRes.email).toBe('example1@example.com');
});

test('get user private data by bad access token', async () => {
  const authedTrcpClient = createTrcpClient('bad access token');
  try {
    await authedTrcpClient.user.getInfo.query();
  } catch (error) {
    console.log(error);
    expect(error).toBeInstanceOf(Error);
  }
});

test('try get user private data', async () => {
  try {
    await trpcClient.user.getInfo.query();
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});

test('get user', async () => {
  const user = await trpcClient.example.getUser.query({
    id: createdUser1.id,
  });
  expect(user.email).toBe(createdUser1.email);
});

test('get users', async () => {
  const users = await trpcClient.example.getUsers.query();
  expect(users).toBeArray();
});

test('delete user', async () => {
  const deleteUserMsg = await trpcClient.example.deleteUser.mutate({
    id: createdUser1.id,
  });
  expect(deleteUserMsg).toBeString();
});

test('delete user again', async () => {
  try {
    await trpcClient.example.deleteUser.mutate({
      id: createdUser1.id,
    });
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});

afterAll(async () => {});
