import { stat } from 'fs/promises';
import * as hasha from 'hasha';

export async function getFileInfo(filePath: string) {
  const fstat = await stat(filePath);

  const execSync = require('child_process').execSync;
  const execSyncRes = execSync(
    'file --mime-type -b "' + filePath + '"',
  ).toString();

  let fileMime = execSyncRes.trim() as string;

  return {
    fileMime,
    fstat,
  };
}

export async function getFileSha256(filePath: string): Promise<string> {
  await Bun.sleep(200);
  return hasha.hashFile(filePath, { algorithm: 'sha256' });
}
