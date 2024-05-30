import type { HonoAppType } from '!src/app_main';
import { hc } from 'hono/client';

const client = hc<HonoAppType>('http://localhost:3000/');

async function callHello() {
  const res = await client.example.hello.$get();
  const url = client.example.hello.$url();
  console.log(url);
  if (res.ok) {
    const data = await res.json();
    console.log('res data', data);
  }
}

async function callPing() {
  const res = await client.example.ping.$get();
  const url = client.example.hello.$url();
  console.log(url);
  if (res.ok) {
    const data = await res.json();
    console.log('res data', data);
  }
}

callHello();
callPing();
