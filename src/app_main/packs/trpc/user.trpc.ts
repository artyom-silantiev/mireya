import { publicProcedure, router } from '!share/trpc';
import { prisma } from '!src/lib_db/prisma.pack';
import { useBcrypt } from '!src/lib_share/composables/bcrypt';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export function createUserTrpc() {
  const bcrypt = useBcrypt();

  return router({
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
          password: z.string(),
        }),
      )
      .query(async (opts) => {
        const input = opts.input;
        const hash = await bcrypt.hash(input.password);
        const createdUser = prisma.user.create({
          data: {
            email: input.email,
            name: input.name || '',
            passwordHash: hash,
          },
        });

        return createdUser;
      }),

    // user login
    userLogin: publicProcedure
      .input(
        z.object({
          email: z.string(),
          password: z.string(),
        }),
      )
      .query(async (opts) => {
        const user = await prisma.user.findUnique({
          where: {
            email: opts.input.email,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'user not found',
          });
        }

        const compareResult = await bcrypt.compare(
          opts.input.password,
          user.passwordHash,
        );

        if (compareResult) {
          return {
            message: 'ok',
            token: (Math.random() * 1e16 + 1e16).toString(16),
          };
        } else {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'bad login',
          });
        }
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

    // deleteUser method
    deleteUser: publicProcedure
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

        await prisma.user.delete({
          where: {
            id: user.id,
          },
        });

        return 'deleted';
      }),
  });
}
