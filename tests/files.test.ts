import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from '@trpc/client';
import type { TrpcAppRouter } from '~/entry';
import { expect, test, beforeAll, afterAll } from 'bun:test';
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

const trpcClient = createTrcpClient();

beforeAll(async () => {
  console.log();
});

let fileUid = '';
test('upload file', async () => {
  const fileData = await fse.readFile(__filename);
  const blob = new Blob([fileData]);
  const file = new File([blob], 'trpc.test.ts') as File;

  const formData = new FormData();
  formData.set('title', 'trpc.test.ts');
  formData.set('file', file);

  const uploadFileRes = await trpcClient.files.uploadFile.mutate(formData);

  console.log('uploadFileRes', uploadFileRes);
  fileUid = uploadFileRes.fileRef.uid;
});

test('get file', async () => {
  const res1 = await fetch(`http://localhost:3000/files/${fileUid}`);
  const res2 = await fetch(`http://localhost:3000/files/${fileUid}/file.ts`);

  console.log(res2);

  expect(res1.status).toBe(200);
  expect(res2.status).toBe(200);
});

test('delete file', async () => {
  const res = await trpcClient.files.deleteFileRef.mutate({
    fileRefUid: fileUid,
  });
  console.log(res);
});

afterAll(async () => {});
