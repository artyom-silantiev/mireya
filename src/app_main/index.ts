import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { router, createContext } from '!share/trpc';
import * as AppLifecycle from '!src/lib_share/app_lifecycle';
import { exampleHono } from './packs/example/example.pack';
import { helloTrpc, userTrpc } from './packs/trpc/trpc.pack';

const trpcRouter = router({
  hello: helloTrpc,
  user: userTrpc,
});
export type TrpcAppRouter = typeof trpcRouter;

const app = new Hono()
  .use(
    '/trpc/*',
    trpcServer({
      router: trpcRouter,
      createContext,
    }),
  )
  .route('/example', exampleHono);

export type HonoAppType = typeof app;

AppLifecycle.onAppInit(() => {
  console.log('application run');
});
AppLifecycle.onAppDestroy(() => {
  console.log('application destroy');
});
AppLifecycle.applicationRun();

export default app;
