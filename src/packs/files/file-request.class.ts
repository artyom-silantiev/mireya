import { type DbFile } from '@prisma/client';
import { resolve } from 'path';
import { useEnv } from '~/lib/env/env';
import { getThumbCacheDirForDbFile } from './files-utils';

export type ThumbParam = {
  type: 'width' | 'name';
  name: string | null;
};

const env = useEnv();
export type FileRequestType = 'video' | 'image' | 'audio';

export class FileRequest {
  type = null as FileRequestType | null;
  format = null as string | null;
  uid: string;
  thumb!: ThumbParam;

  constructor(
    uid: string,
    params?: {
      type?: FileRequestType | null;
      format?: string | null;
      thumb?: ThumbParam;
    },
  ) {
    this.uid = uid;
    if (params) {
      if (params.type) {
        this.type = params.type;
      }
      if (params.format) {
        this.format = params.format;
      }
      if (params.thumb) {
        this.thumb = params.thumb;
      }
    }
  }

  normalizeThumb(width: number, height: number) {
    if (this.thumb.type === 'width' && typeof this.thumb.name === 'number') {
      this.thumb.name = FileRequest.parseThumbSize(
        parseInt(this.thumb.name),
        width,
        env.LOCAL_FILES_CACHE_MIN_THUMB_LOG_SIZE,
      );
    } else if (this.thumb.type === 'name') {
      if (this.thumb.name === 'fullhd') {
        if (width > 1920 || height > 1920) {
          // noting
        } else {
          return true;
        }
      }
    }
    return false;
  }

  getThumbFile(file: DbFile) {
    const thumbCacheDir = getThumbCacheDirForDbFile(file);
    const thumbTypeDir = `${this.thumb.type}_${this.thumb.name}`;
    const thumbDir = resolve(thumbCacheDir, thumbTypeDir);

    return {
      thumbDir,
      file: resolve(thumbDir, 'file.jpg'),
      meta: resolve(thumbDir, 'meta.json'),
    };
  }

  static parseThumbSize(thumbsSize: number, width: number, minLog: number) {
    if (thumbsSize > width) {
      thumbsSize = width;
    }

    const sizeLog2 = Math.max(minLog, Math.floor(Math.log2(thumbsSize)));
    thumbsSize = Math.pow(2, sizeLog2);

    return thumbsSize.toString();
  }
}
