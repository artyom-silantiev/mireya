import { publicProcedure, router } from '~/lib/trpc';
import { useBcrypt } from '~/lib/bcrypt';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createAuthTokens, useRefreshToken } from '~/lib/jwt-auth';
import { usePrisma } from '~/lib/prisma';
import { UserRole } from '@prisma/client';
import { serializePrismaDataForJson } from '~/lib/utils/serialize_prisma';

export function createGuestTrpc() {
  const prisma = usePrisma();
  const bcrypt = useBcrypt();

  return router({
    createUser: publicProcedure
      .input(
        z.object({
          name: z.string().nullish(),
          email: z.string(),
          password: z.string(),
        }),
      )
      .mutation(async (opts) => {
        const input = opts.input;
        const hash = await bcrypt.hash(input.password);

        const tmpUser = prisma.user.findFirst({
          where: {
            email: input.email,
          },
        });

        if (!tmpUser) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'user with this email exists',
          });
        }

        await prisma.user.create({
          data: {
            email: input.email,
            name: input.name || '',
            passwordHash: hash,
          },
        });

        return {
          message: 'user created',
        };
      }),

    userLogin: publicProcedure
      .input(
        z.object({
          email: z.string(),
          password: z.string(),
        }),
      )
      .mutation(async (opts) => {
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
          const tokensData = await createAuthTokens(user, UserRole.USER);

          return serializePrismaDataForJson({
            message: 'ok',
            ...tokensData,
          });
        } else {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'bad login',
          });
        }
      }),

    useRefreshToken: publicProcedure
      .input(
        z.object({
          refreshToken: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const newTokens = await useRefreshToken(input.refreshToken);

        return serializePrismaDataForJson({
          message: 'ok',
          ...newTokens,
        });
      }),
  });
}
