import { resolve } from 'path';
import { useEnv } from '~/lib/env/env';

const env = useEnv();

export const FilesDefs = {
  DIR: resolve(env.DIR_DATA, 'files'),
  DIR_IMAGES_THUMBS: resolve(env.DIR_TEMP, 'images_thumbs'),
};
