import { Hono } from 'hono';
import { router, createContext } from './trpc';
import { trpcServer } from '@hono/trpc-server';
import { HelloModule } from './modules/hello';
import { UserModule } from './modules/user';

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

export default app;
