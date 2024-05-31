import { createHelloTrpc } from './hello.trpc';
import { createUserTrpc } from './user.trpc';

export const helloTrpc = createHelloTrpc();
export const userTrpc = createUserTrpc();
