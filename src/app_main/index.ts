import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { HelloModule } from './modules/hello/hello.module';
import { UserModule } from './modules/user/user.module';
import { router, createContext } from '@share/trpc';
import { AppLifecycle } from '@src/lib_share/app_lifecycle';

const appRouter = router({
  hello: HelloModule.trpcRouter,
  user: UserModule.trpcRouter,
});
export type AppRouter = typeof appRouter;

const app = new Hono();

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

AppLifecycle.onAppInit(() => {
  console.log('application run');
});
AppLifecycle.onAppDestroy(() => {
  console.log('application destroy');
});
AppLifecycle.applicationRun();

export default app;
