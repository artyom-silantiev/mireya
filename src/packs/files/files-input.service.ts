import type { FilesDbService } from './filesdb.service';
import type { FilesMakeService } from './files-make.service';
import { Readable } from 'stream';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { useEnv } from '~/lib/env/env';
import { useBs58 } from '~/lib/bs58';

const env = useEnv();
const bs58 = useBs58();

export class FilesInputService {
  constructor(
    private filesDbService: FilesDbService,
    private filesMake: FilesMakeService,
  ) {}

  async uploadFile(file: File) {
    const webRs = file.stream();
    const rs = Readable.fromWeb(webRs);
    const tempName = bs58.uid();
    const tempFile = join(env.DIR_TEMP, tempName);
    const ws = createWriteStream(tempFile);

    rs.pipe(ws);
    await new Promise<boolean>((resolve, reject) => {
      rs.on('end', () => {
        resolve(true);
      });
      rs.on('error', (err) => {
        reject(err);
      });
    });

    const fileRef = await this.uploadFileByFilePath(tempFile);

    return fileRef;
  }

  async uploadFileByFilePath(imageFile: string) {
    const fileWrap = await this.filesMake.createFileDb(imageFile);
    const fileRef = await this.filesDbService.createFileRefByFile(
      fileWrap.file,
    );
    return { status: 201, fileRef };
  }
}
