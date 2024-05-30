import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { HelloTrpc } from './packs/hello/hello.trpc';
import { UserTrpc } from './packs/user/user.trpc';
import { router, createContext } from '!share/trpc';
import * as AppLifecycle from '!src/lib_share/app_lifecycle';
import { ExampleHono } from './packs/example/example.hono';

const trpcRouter = router({
  hello: HelloTrpc,
  user: UserTrpc,
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
  .route('/example', ExampleHono);

export type HonoAppType = typeof app;

AppLifecycle.onAppInit(() => {
  console.log('application run');
});
AppLifecycle.onAppDestroy(() => {
  console.log('application destroy');
});
AppLifecycle.applicationRun();

export default app;
