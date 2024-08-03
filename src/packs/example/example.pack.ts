import { createExampleHono } from './example.hono';
import { ExampleService } from './example.service';
import { createExampleTrpc } from './example.trpc';
import { createGuestTrpc } from './guest.trpc';
import { createUserTrpc } from './user.trpc';

export const exampleService = new ExampleService(); // internal service
export const exampleHono = createExampleHono(exampleService);

export const exampleTrpc = createExampleTrpc(exampleService);
export const userTrpc = createUserTrpc();
export const guestTrpc = createGuestTrpc();
