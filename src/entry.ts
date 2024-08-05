import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { router, createContext } from '~/lib/trpc';
import * as AppLifecycle from '~/lib/app_lifecycle';
import {
  exampleHono,
  exampleTrpc,
  guestTrpc,
  userTrpc,
} from './packs/example/example.pack';
import { serveStatic } from 'hono/bun';
import { useEnv } from '~/lib/env/env';
import fsExtra from 'fs-extra/esm';
import { filesHone, filesTrpc } from './packs/files/files.pack';
import './packs/mailer/mailer.pack';

const trpcRouter = router({
  example: exampleTrpc,
  user: userTrpc,
  guest: guestTrpc,
  files: filesTrpc,
});
export type TrpcAppRouter = typeof trpcRouter;

const app = new Hono()
  .route('/api', exampleHono)
  .route('/files', filesHone)
  .use(
    '/trpc/*',
    trpcServer({
      router: trpcRouter,
      createContext,
    }),
  )
  .use(
    '*',
    serveStatic({
      root: './static',
    }),
  );

export type HonoAppType = typeof app;

AppLifecycle.onAppInit(async () => {
  const env = useEnv();
  await fsExtra.mkdirs(env.DIR_DATA);
  await fsExtra.mkdirs(env.DIR_TEMP);

  env.print();
  console.log('application run');
});
AppLifecycle.onAppDestroy(() => {
  console.log('application destroy');
});
AppLifecycle.applicationRun();

export default app;
