import { initTRPC } from '@trpc/server';
import { verifyAccessToken, type JtwAuth } from './jwt-auth';

export async function createContext(ctx: { req: Request }) {
  let user = null as JtwAuth | null;

  let authorizationHeader = ctx.req.headers.get('authorization');
  if (authorizationHeader) {
    const token = authorizationHeader.split(' ')[1] as string;
    user = await verifyAccessToken(token);
  }

  return { user };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
