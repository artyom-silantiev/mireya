import type { HonoAppType } from '~/entry';
import { hc } from 'hono/client';
import * as fse from 'fs-extra';
import { test, beforeAll, afterAll } from 'bun:test';

const NODE_PORT = '3000';

const client = hc<HonoAppType>(`http://localhost:${NODE_PORT}/`);
beforeAll(async () => {
  console.log();
  const ws = new WritableStream({
    write(chunk: Uint8Array) {
      console.log('\x1b[36m', Buffer.from(chunk).toString('utf8'), '\x1b[0m');
    },
  });
  // proc.stdout.pipeTo(ws);
});

test('hello', async () => {
  const res = await client.api.hello.$get();

  if (res.ok) {
    const data = await res.json();
    console.log('callHello res data', data);
  }
});

test('ping', async () => {
  const res = await client.api.ping.$get();

  if (res.ok) {
    const data = await res.json();
    console.log('callPing res data', data);
  }
});

test('upload', async () => {
  const fileData = await fse.readFile(__filename);
  const blob = new Blob([fileData]);
  const file = new File([blob], 'hono_rpc.test.ts') as string | File;

  const res = await client.api.upload.$post({
    form: {
      data: Date.now().toString(),
      file,
    },
  });

  if (res.ok) {
    const data = await res.json();
    console.log('callUpload res data', data);
  }
});

afterAll(async () => {});
