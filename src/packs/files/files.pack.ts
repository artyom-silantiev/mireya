import { FilesDbService } from './filesdb.service';
import { FilesCacheService } from './files-cache.service';
import { FilesClearService } from './files-clear.service';
import { FilesInputService } from './files-input.service';
import { FilesMakeService } from './files-make.service';
import { FilesOutputService } from './files-output.service';
import { createFilesHono } from './files.hono';
import { createFilesTrpc } from './files.trpc';

export const filesDbService = new FilesDbService();
export const filesMakeService = new FilesMakeService(filesDbService);
export const filesInputService = new FilesInputService(
  filesDbService,
  filesMakeService,
);
const filesCacheService = new FilesCacheService();
const filesClearService = new FilesClearService(filesCacheService);
export const filesOutPutService = new FilesOutputService(
  filesDbService,
  filesMakeService,
  filesCacheService,
);

export const filesTrpc = createFilesTrpc(filesInputService, filesClearService);
export const filesHone = createFilesHono(filesOutPutService);

// TODO improve mime type
// TODO add ext to dbFile row
