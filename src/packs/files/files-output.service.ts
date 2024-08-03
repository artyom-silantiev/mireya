import { MediaType, type DbFile } from '@prisma/client';
import type { FileMeta } from './types';
import type { FileRequest } from './file-request.class';
import type { FilesDbService } from './filesdb.service';
import type { FilesMakeService } from './files-make.service';
import { FilesDefs } from './defs';
import path from 'path';
import fsExtra from 'fs-extra/esm';
import { existsSync } from 'fs';
import type { FilesCacheService } from './files-cache.service';

export class FilesOutputService {
  constructor(
    private filesDbService: FilesDbService,
    private filesMakeService: FilesMakeService,
    private filesCacheService: FilesCacheService,
  ) {}

  getFileMetaFromFileDb(fileDb: DbFile) {
    const absPathToFile = path.resolve(FilesDefs.DIR, fileDb.pathToFile);

    const fileMeta = {
      absPathToFile,
      sha256: fileDb.sha256,
      contentType: fileDb.type,
      mime: fileDb.mime,
      size: fileDb.size,
      width: fileDb.width || null,
      height: fileDb.height || null,
      durationSec: fileDb.durationSec || null,
      createdAt: fileDb.createdAt,
    } as FileMeta;

    return fileMeta;
  }

  async getFileDbPathByFileRefRequest(fileRefRequest: FileRequest) {
    const uid = fileRefRequest.uid;

    const cacheFileDbMetaRaw = await this.filesCacheService.get(fileRefRequest);
    if (cacheFileDbMetaRaw) {
      const fileMeta = JSON.parse(cacheFileDbMetaRaw) as FileMeta;
      return { status: 200, fileMeta };
    }

    const tmpFileRef = await this.filesDbService.getDbFileRefDbByUid(uid);
    let fileMeta!: FileMeta;
    let status = tmpFileRef.status;

    if (fileRefRequest.thumb) {
      if (tmpFileRef.file.type !== MediaType.IMAGE) {
        throw 406;
      }

      const orgFile = tmpFileRef.file;

      if (fileRefRequest.normalizeThumb(orgFile.width!, orgFile.height!)) {
        fileMeta = this.getFileMetaFromFileDb(tmpFileRef.file);
      }

      const thumbFile = fileRefRequest.getThumbFile(orgFile);
      if (!fileMeta) {
        // get thumb from FS
        try {
          if (existsSync(thumbFile.file)) {
            fileMeta = await fsExtra.readJSON(thumbFile.meta);
          }
        } catch (error) {}
      }

      if (!fileMeta) {
        fileMeta = await this.filesMakeService.createNewThumbForLocalFile(
          orgFile,
          fileRefRequest.thumb,
          thumbFile,
        );
        status = 208;
      }
    } else {
      fileMeta = this.getFileMetaFromFileDb(tmpFileRef.file);
    }

    await this.filesCacheService.set(
      fileRefRequest,
      Object.assign(fileMeta, { status: 200 }),
    );

    return { status, fileMeta: fileMeta };
  }
}
