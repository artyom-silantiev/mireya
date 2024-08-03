import { useRedis } from '~/lib/redis';
import type { FileRequest } from './file-request.class';
import type { FileMeta } from './types';

const prefixKey = 'file';

export class FilesCacheService {
  getPrefixKey() {
    return prefixKey;
  }

  key(fileReq: FileRequest) {
    let fileCache = `${prefixKey}:${fileReq.uid}`;
    if (fileReq.thumb) {
      fileCache += ':' + fileReq.thumb.name;
    }
    return fileCache;
  }

  async get(lfReq: FileRequest) {
    const cacheKey = this.key(lfReq);
    const fileCacheKey = await useRedis().get(cacheKey);
    return fileCacheKey || null;
  }

  async set(lfReq: FileRequest, fileMeta: FileMeta) {
    const cacheKey = this.key(lfReq);
    await useRedis().set(cacheKey, JSON.stringify(fileMeta), 'EX', 300);
  }

  async delRefByUid(uid: string) {
    const redis = useRedis();
    const keys = await redis.keys(`${prefixKey}:${uid}*`);
    for (const key of keys) {
      await redis.del(key);
    }
  }
}
