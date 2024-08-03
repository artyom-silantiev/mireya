import * as hasha from 'hasha';

export function getMimeFromPath(filePath: string) {
  const execSync = require('child_process').execSync;
  const mimeType = execSync(
    'file --mime-type -b "' + filePath + '"',
  ).toString();
  return mimeType.trim();
}

export async function getFileSha256(filePath: string): Promise<string> {
  await Bun.sleep(200);
  return hasha.hashFile(filePath, { algorithm: 'sha256' });
}
