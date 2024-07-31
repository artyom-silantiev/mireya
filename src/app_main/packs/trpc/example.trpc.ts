import { publicProcedure, router } from '!share/trpc';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import type { ExampleService } from '../example/example.service';
import { zodFormDataOrObject } from '!src/lib_share/utils/trpc';
import { TRPCError } from '@trpc/server';
import { usePrisma } from '!src/lib_db/prisma.pack';
import { useBcrypt } from '!src/lib_share/composables/bcrypt';
import { serializeBigIntInObject } from '!src/lib_share/utils';

export function createExampleTrpc(exampleService: ExampleService) {
  const prisma = usePrisma();
  const bcrypt = useBcrypt();

  return router({
    // hello method
    hello: publicProcedure.input(z.string().nullish()).query((opts) => {
      const name = opts.input;
      return `Hello, ${name ? name : 'user'}!`;
    }),

    // getVer method
    getVersion: publicProcedure.query(() => {
      return '1.0.0';
    }),

    uploadFile: publicProcedure
      .input(
        zodFormDataOrObject({
          title: zfd.text(),
          file: zfd.file(),
        }),
      )
      .mutation(async ({ input }) => {
        const file = input.file;

        console.log('input', input);

        await exampleService.upload(file);

        return {
          message: 'file uploaded',
        };
      }),

    clearUsers: publicProcedure.query(async () => {
      await prisma.user.deleteMany();
    }),

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

        const user = await prisma.user.create({
          data: {
            email: input.email,
            name: input.name || '',
            passwordHash: hash,
          },
        });

        return serializeBigIntInObject(user);
      }),

    getUser: publicProcedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .query(async (opts) => {
        const user = await prisma.user.findUnique({
          where: {
            id: BigInt(opts.input.id),
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'user not found',
          });
        }

        return serializeBigIntInObject(user);
      }),

    getUsers: publicProcedure.query(async () => {
      const users = await prisma.user.findMany();
      return users.map((x) => serializeBigIntInObject(x));
    }),

    deleteUser: publicProcedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .mutation(async (opts) => {
        const user = await prisma.user.findUnique({
          where: {
            id: BigInt(opts.input.id),
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
