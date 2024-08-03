import { publicProcedure, router } from '~/lib/trpc';
import { zfd } from 'zod-form-data';
import { TRPCError } from '@trpc/server';
import { serializePrismaDataForJson } from '~/lib/utils/serialize_prisma';
import { zodFormDataOrObject } from '~/lib/utils/zod';
import type { FilesInputService } from './files-input.service';
import { z } from 'zod';
import type { FilesClearService } from './files-clear.service';

export function createFilesTrpc(
  filesInputService: FilesInputService,
  filesClearService: FilesClearService,
) {
  return router({
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

        const uploadRes = await filesInputService.uploadFile(file);

        return serializePrismaDataForJson(uploadRes);
      }),

    deleteFileRef: publicProcedure
      .input(
        z.object({
          fileRefUid: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        await filesClearService.deleteDbFileRefByUid(input.fileRefUid);

        return {
          message: 'file deleted',
        };
      }),
  });
}
