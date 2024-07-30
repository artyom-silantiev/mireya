import { exampleService } from '../example/example.pack';
import { createHelloTrpc } from './hello.trpc';
import { createUserTrpc } from './user.trpc';

export const helloTrpc = createHelloTrpc(exampleService);
export const userTrpc = createUserTrpc();
