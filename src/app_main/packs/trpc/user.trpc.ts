import { publicProcedure, router } from '!share/trpc';
import { TRPCError } from '@trpc/server';
import { usePrisma } from '!src/lib_db/prisma.pack';
import { serializePrismaDataForJson } from '!src/lib_share/utils';

export function createUserTrpc() {
  const prisma = usePrisma();

  const protectedProducedure = publicProcedure.use(
    async function isAuthed(opts) {
      const { ctx } = opts;
      // `ctx.user` is nullable
      if (!ctx.user) {
        //     ^?
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      return opts.next({
        ctx: {
          // ✅ user value is known to be non-null now
          user: ctx.user,
          // ^?
        },
      });
    },
  );

  return router({
    // getInfo method
    getInfo: protectedProducedure.query(async (opts) => {
      const userId = opts.ctx.user.userId;

      const user = await prisma.user.findFirstOrThrow({
        where: {
          id: userId,
        },
      });

      return serializePrismaDataForJson(user);
    }),
  });
}
