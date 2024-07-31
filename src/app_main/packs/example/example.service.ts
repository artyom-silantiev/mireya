import { useEnv } from '!src/lib_share/composables/env/env';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

const env = useEnv();

export class ExampleService {
  async upload(file: File) {
    const webRs = file.stream();
    const rs = Readable.fromWeb(webRs);
    const writePath = join(env.DIR_TEMP, file.name);
    const ws = createWriteStream(writePath);

    rs.pipe(ws);
    await new Promise<boolean>((resolve, reject) => {
      rs.on('end', () => {
        resolve(true);
      });
      rs.on('error', (err) => {
        reject(err);
      });
    });
  }
}
