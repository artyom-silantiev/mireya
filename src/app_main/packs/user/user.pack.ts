import { prisma } from '!db/prisma';
import { publicProcedure, router } from '!share/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const trpcRouter = router({
  // clearUsers method
  clearUsers: publicProcedure.query(async () => {
    await prisma.user.deleteMany();
  }),

  // createUser method
  createUser: publicProcedure
    .input(
      z.object({
        name: z.string().nullish(),
        email: z.string(),
      }),
    )
    .query((opts) => {
      const createdUser = prisma.user.create({
        data: opts.input,
      });

      return createdUser;
    }),

  // getUser method
  getUser: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async (opts) => {
      const user = await prisma.user.findUnique({
        where: {
          id: opts.input.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'user not found',
        });
      }

      return user;
    }),

  // getUsers method
  getUsers: publicProcedure.query(async () => {
    return await prisma.user.findMany();
  }),
});

export const UserPack = {
  trpcRouter,
};
