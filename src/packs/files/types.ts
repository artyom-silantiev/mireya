import { MediaType, type DbFile } from '@prisma/client';

export type FileWrap = {
  status: number;
  file: DbFile;
};

export type FileMeta = {
  absPathToFile: string;
  contentType: MediaType;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  sha256: string;
  isThumb?: boolean;
  orgId?: string;
  createdAt: Date | string;
};
