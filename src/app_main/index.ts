import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { HelloPack } from './packs/hello/hello.pack';
import { UserPack } from './packs/user/user.pack';
import { router, createContext } from '!share/trpc';
import { AppLifecycle } from '!src/lib_share/app_lifecycle';
import { ExamplePack } from './packs/example/example.pack';

const trpcRouter = router({
  hello: HelloPack.trpcRouter,
  user: UserPack.trpcRouter,
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
  .route('/example', ExamplePack.honoRouter);

export type HonoAppType = typeof app;

AppLifecycle.onAppInit(() => {
  console.log('application run');
});
AppLifecycle.onAppDestroy(() => {
  console.log('application destroy');
});
AppLifecycle.applicationRun();

export default app;
