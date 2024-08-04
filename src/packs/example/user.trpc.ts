import { publicProcedure, router } from '~/lib/trpc';
import { TRPCError } from '@trpc/server';
import { serializePrismaDataForJson } from '~/lib/utils/serialize_prisma';
import { usePrisma } from '~/lib/prisma';

export function createUserTrpc() {
  const prisma = usePrisma();

  const protectedProducedure = publicProcedure.use(
    async function isAuthed(opts) {
      const { ctx } = opts;
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      return opts.next({
        ctx: {
          user: ctx.user,
        },
      });
    },
  );

  return router({
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
