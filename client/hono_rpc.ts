import type { HonoAppType } from '!src/app_main';
import { hc } from 'hono/client';
import * as fse from 'fs-extra';

const client = hc<HonoAppType>('http://localhost:3000/');

async function callHello() {
  const res = await client.example.hello.$get();

  if (res.ok) {
    const data = await res.json();
    console.log('callHello res data', data);
  }
}

async function callPing() {
  const res = await client.example.ping.$get();

  if (res.ok) {
    const data = await res.json();
    console.log('callPing res data', data);
  }
}

async function callUpload() {
  const fileData = await fse.readFile(__filename);
  const blob = new Blob([fileData]);
  const file = new File([blob], 'hono_rpc.ts') as string | File;

  const res = await client.example.upload.$post({
    form: {
      data: Date.now().toString(),
      file,
    },
  });

  if (res.ok) {
    const data = await res.json();
    console.log('callUpload res data', data);
  }
}

await callHello();
await callPing();
await callUpload();
