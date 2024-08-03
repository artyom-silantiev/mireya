import { useBs58 } from '~/lib/bs58';
import { useEnv } from '~/lib/env/env';
import { usePrisma } from '~/lib/prisma';
import type { FilesDbService } from './filesdb.service';
import fsExtra from 'fs-extra/esm';
import { MediaType, type DbFile } from '@prisma/client';
import { getFileSha256, getFileInfo } from '~/lib/utils/files';
import type { FileMeta, FileWrap } from './types';
import { FilesDefs } from './files-defs';
import type { ThumbParam } from './file-request.class';
import sharp from 'sharp';
import path from 'path';
import { getMediaContentProbe } from '~/lib/utils/ffmpeg';
import dayjs from 'dayjs';

export class FilesMakeService {
  private env = useEnv();
  private prisma = usePrisma();
  private bs58 = useBs58();

  constructor(private filesDb: FilesDbService) {}

  async createFileDb(
    tempFile: string,
    params?: {
      noValidation?: boolean;
    },
  ): Promise<FileWrap> {
    const fileSha256Hash = await getFileSha256(tempFile);

    let fileWrap!: FileWrap;
    try {
      fileWrap = await this.filesDb.getDbFileDbBySha256(fileSha256Hash);
    } catch {}
    if (fileWrap) {
      await fsExtra.remove(tempFile);
      return { ...fileWrap, ...{ status: 208 } };
    }

    const { fileMime, fstat } = await getFileInfo(tempFile);

    let contentType = MediaType.OTHER as MediaType;
    if (fileMime.startsWith('image/')) {
      contentType = MediaType.IMAGE;
    } else if (fileMime.startsWith('audio/')) {
      contentType = MediaType.AUDIO;
    } else if (fileMime.startsWith('video/')) {
      contentType = MediaType.VIDEO;
    }

    let size!: number;
    let width!: number;
    let height!: number;
    let duration: number;

    if (contentType === MediaType.IMAGE) {
      const imageInfo = await sharp(tempFile).metadata();
      size = fstat.size;
      width = imageInfo.width!;
      height = imageInfo.height!;
    } else if (contentType === MediaType.AUDIO) {
      const fileProbe = await getMediaContentProbe(tempFile);
      const stream = fileProbe.audioStreams![0];

      size = fileProbe.format.size!;
      duration = parseFloat(stream.duration!);
    } else if (contentType === MediaType.VIDEO) {
      const fileProbe = await getMediaContentProbe(tempFile);
      const stream = fileProbe.videoStreams![0];

      size = fileProbe.format.size!;
      width = stream.width!;
      height = stream.height!;
      duration = parseFloat(stream.duration!);
    } else {
      size = fstat.size;
    }

    if (!params || !params.noValidation) {
    }

    const now = dayjs();
    const year = now.format('YYYY');
    const month = now.format('MM');
    const day = now.format('DD');
    const locaFiles = FilesDefs.DIR;
    const locDirForFile = path.join(year, month, day);
    const absDirForFile = path.resolve(locaFiles, locDirForFile);
    const locPathToFile = path.join(locDirForFile, fileSha256Hash);
    const absPathToFile = path.resolve(absDirForFile, fileSha256Hash);
    await fsExtra.mkdirs(absDirForFile);
    await fsExtra.move(tempFile, absPathToFile, { overwrite: true });

    const file = await this.prisma.dbFile.create({
      data: {
        sha256: fileSha256Hash,
        mime: fileMime,
        size,
        width: width || null,
        height: height || null,
        durationSec: duration! ? Math.floor(duration) : null,
        pathToFile: locPathToFile,
        type: contentType,
      },
    });

    fileWrap = {
      status: 201,
      file: file,
    };

    return fileWrap;
  }

  async createNewThumbForLocalFile(
    orgFile: DbFile,
    thumb: ThumbParam,
    thumbFile: {
      file: string;
      meta: string;
    },
  ) {
    const tmpNewThumbImageFile = path.resolve(
      this.env.DIR_TEMP,
      this.bs58.uid() + '.thumb.jpg',
    );
    const absFilePath = path.resolve(FilesDefs.DIR, orgFile.pathToFile);
    const image = sharp(absFilePath);
    const metadata = await image.metadata();

    let info!: sharp.OutputInfo;
    if (thumb.type === 'width' && thumb.name) {
      info = await image
        .resize(parseInt(thumb.name))
        .jpeg({ quality: 50 })
        .toFile(tmpNewThumbImageFile);
    } else if (thumb.type === 'name') {
      if (thumb.name === 'fullhd') {
        if (metadata.height! > metadata.width!) {
          info = await image
            .resize({ height: 1920 })
            .jpeg({ quality: 50 })
            .toFile(tmpNewThumbImageFile);
        } else {
          info = await image
            .resize({ width: 1920 })
            .jpeg({ quality: 50 })
            .toFile(tmpNewThumbImageFile);
        }
      }
    }

    const thumbDir = thumbFile.file.replace(/^(.*)\/.*$/, '$1');
    await fsExtra.mkdirs(thumbDir);
    await fsExtra.move(tmpNewThumbImageFile, thumbFile.file);
    const sha256 = await getFileSha256(thumbFile.file);
    const thumbMeta = {
      absPathToFile: thumbFile.file,
      contentType: MediaType.IMAGE,
      mime: 'image/jpeg',
      size: info.size,
      width: info.width,
      height: info.height,
      durationSec: null,
      sha256: sha256,
      isThumb: true,
      orgId: orgFile.id.toString(),
      createdAt: new Date().toISOString(),
    } as FileMeta;
    await fsExtra.writeJSON(thumbFile.meta, thumbMeta);

    return thumbMeta;
  }
}
