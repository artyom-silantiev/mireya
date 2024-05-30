import { createWriteStream } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

export class ExampleService {
  async upload(file: File) {
    const webRs = file.stream();
    const rs = Readable.fromWeb(webRs);
    const ws = createWriteStream(join(process.cwd(), 'work', file.name));

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
