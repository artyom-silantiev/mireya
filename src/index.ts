import { Hono } from 'hono';
import { router } from './trpc';
import { trpcServer } from '@hono/trpc-server';
import { HelloModule } from './modules/hello';

const appRouter = router({
  hello: HelloModule.trpcRouter,
});
export type AppRouter = typeof appRouter;

const app = new Hono();

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
  }),
);

export default app;
