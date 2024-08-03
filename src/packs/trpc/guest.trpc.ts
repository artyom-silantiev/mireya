import { publicProcedure, router } from '!src/lib/trpc';
import { useBcrypt } from '!src/lib/bcrypt';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { usePrisma } from '!src/packs/prisma/prisma.pack';
import { createToken } from '!src/packs/jwt/jwt.pack';

export function createGuestTrpc() {
  const prisma = usePrisma();
  const bcrypt = useBcrypt();

  return router({
    // createUser method
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

    // user login
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
          const token = createToken(user.id.toString());

          return {
            message: 'ok',
            token: token,
          };
        } else {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'bad login',
          });
        }
      }),
  });
}
