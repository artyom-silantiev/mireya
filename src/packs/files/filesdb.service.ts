import type { DbFile } from '@prisma/client';
import { HTTPException } from 'hono/http-exception';
import { useBs58 } from '~/lib/bs58';
import { usePrisma } from '~/lib/prisma';

export class FilesDbService {
  prisma = usePrisma();
  bs58 = useBs58();

  async getDbFileById(id: bigint) {
    const localFile = await this.prisma.dbFile.findFirst({
      where: {
        id,
      },
    });
    return localFile || null;
  }

  async getDbFileRefDbByUid(uid: string) {
    const fileRef = await this.prisma.dbFileRef.findFirst({
      where: {
        uid,
      },
      include: {
        file: true,
      },
    });

    if (!fileRef) {
      throw new HTTPException(404);
    }

    return { status: 200, file: fileRef.file };
  }

  async getDbFileDbBySha256(sha256: string) {
    const file = await this.prisma.dbFile.findFirst({
      where: {
        sha256,
      },
    });

    if (!file) {
      throw new HTTPException(404);
    }

    return { status: 200, file: file };
  }

  async createFileRefByFile(fileDb: DbFile) {
    const fileLink = await this.prisma.dbFileRef.create({
      data: {
        uid: this.bs58.uid(),
        fileId: fileDb.id,
      },
      include: {
        file: true,
      },
    });

    return fileLink;
  }
}
