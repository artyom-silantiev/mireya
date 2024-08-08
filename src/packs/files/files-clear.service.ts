import { usePrisma } from '~/lib/prisma';
import type { FilesCacheService } from './files-cache.service';
import path from 'path';
import { FilesDefs } from './files-defs';
import fsExtra from 'fs-extra/esm';
import type { DbFileRef } from '@prisma/client';

const prisma = usePrisma();

export class FilesClearService {
  constructor(private filesCacheService: FilesCacheService) {}

  async deleteDbFileRefByUid(uid: string) {
    const dbFileRef = await prisma.dbFileRef.findFirstOrThrow({
      where: {
        uid,
      },
    });

    await this.deleteDbFileRef(dbFileRef);
  }

  async deleteDbFileRefById(id: bigint) {
    const dbFileRef = await prisma.dbFileRef.findFirstOrThrow({
      where: {
        id,
      },
    });

    await this.deleteDbFileRef(dbFileRef);
  }

  async deleteDbFileRef(dbFileRef: DbFileRef) {
    await this.filesCacheService.delRefByUid(dbFileRef.uid);
    await prisma.$transaction(async (prisma) => {
      await prisma.dbFileRef.delete({
        where: {
          id: dbFileRef.id,
        },
      });

      const countFileRefs = await prisma.dbFileRef.count({
        where: {
          fileId: dbFileRef.fileId,
        },
      });

      if (countFileRefs === 0) {
        const file = await prisma.dbFile.findFirstOrThrow({
          where: {
            id: dbFileRef.fileId,
          },
        });

        await prisma.dbFile.delete({
          where: { id: file.id },
        });

        const fileSha256Hash = file.sha256;
        const p1 = fileSha256Hash.substring(0, 2);
        const p2 = fileSha256Hash.substring(2, 4);
        const p3 = fileSha256Hash.substring(4, 6);
        const p4 = fileSha256Hash.substring(6, 8);
        const p5 = fileSha256Hash;
        const thumbDir = path.resolve(
          FilesDefs.DIR_IMAGES_THUMBS,
          p1,
          p2,
          p3,
          p4,
          p5,
        );
        await fsExtra.remove(thumbDir);

        const absPathToFile = path.resolve(FilesDefs.DIR, file.pathToFile);
        await fsExtra.remove(absPathToFile);
      }
    });
  }
}
