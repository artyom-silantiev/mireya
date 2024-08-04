import { useEnv } from '~/lib/env/env';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { useBs58 } from '~/lib/bs58';

const env = useEnv();
const bs58 = useBs58();

export class ExampleService {
  async upload(file: File) {
    const tempName = bs58.uid();
    const tmpFile = join(env.DIR_TEMP, tempName);
    console.log('tmpFile', tmpFile);

    /*
    const webRs = file.stream();
    const rs = Readable.fromWeb(webRs);
    const ws = createWriteStream(tmpFile);
    rs.pipe(ws);
    await new Promise<boolean>((resolve, reject) => {
      rs.on('end', () => {
        resolve(true);
      });
      rs.on('error', (err) => {
        reject(err);
      });
    });
    */
  }
}
