import { exampleService } from '../example/example.pack';
import { createGuestTrpc } from './guest.trpc';
import { createExampleTrpc } from './example.trpc';
import { createUserTrpc } from './user.trpc';

export const exampleTrpc = createExampleTrpc(exampleService);
export const userTrpc = createUserTrpc();
export const guestTrpc = createGuestTrpc();
