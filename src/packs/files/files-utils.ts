import type { DbFile } from '@prisma/client';
import { resolve } from 'path';
import { FilesDefs } from './files-defs';

export function getThumbCacheDirForDbFile(dbFile: DbFile) {
  const fileSha256Hash = dbFile.sha256;
  const p1 = fileSha256Hash.substring(0, 2);
  const p2 = fileSha256Hash.substring(2, 4);
  const p3 = fileSha256Hash.substring(4, 6);
  const p4 = fileSha256Hash.substring(6, 8);
  const p5 = dbFile.id.toString();

  const thumbDir = resolve(FilesDefs.DIR_IMAGES_THUMBS, p1, p2, p3, p4, p5);

  return thumbDir;
}
