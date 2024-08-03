import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs-extra';
import { shSync } from '../sh';

// set NODE_HOST if app running in docker container
if (fs.existsSync('/.dockerenv')) {
  process.env.NODE_HOST = shSync('hostname').replace('\n', '');
}

dotenv.config();

export enum NodeEnvType {
  development = 'development',
  production = 'production',
}

export enum NodeRole {
  MASTER = 'MASTER',
  WORKER = 'WORKER',
}

export enum SendEmailType {
  sync = 'sync',
  queue = 'queue',
}

export enum Protocol {
  http = 'http',
  https = 'https',
}

export enum ClusterAppType {
  Cli = 'cli',
  Web = 'web',
}

const E = process.env;

let onlyDefault = false;

const NODE_APP_INDEX = toInt(E.NODE_APP_INDEX, 0);
const NODE_APP_TYPE = toEnum(E.NODE_APP_TYPE, Object.values(ClusterAppType), ClusterAppType.Web);

export class Env {
  NODE_APP_INDEX = NODE_APP_INDEX;
  NODE_APP_TYPE = NODE_APP_TYPE;
  NODE_ENV = toEnum(E.NODE_ENV, Object.values(NodeEnvType), NodeEnvType.development) as NodeEnvType;
  NODE_ROLE = toEnum(E.NODE_ROLE, Object.values(NodeRole), NodeRole.MASTER) as NodeRole;
  NODE_PORT = toInt(E.NODE_PORT, 3000, true);
  NODE_HOST = toString(E.NODE_HOST, 'localhost');
  NODE_PROTOCOL = toEnum(E.NODE_PROTOCOL, Object.values(Protocol), Protocol.http) as Protocol;

  DATABASE_URL = toString(E.DATABASE_URL, 'postgres://postgres:postgres@localhost:5432/postgres?schema=public');

  REDIS_HOST = toString(E.REDIS_HOST, 'localhost');
  REDIS_PORT = toInt(E.REDIS_PORT, 6379);
  REDIS_DB = toInt(E.REDIS_DB, 0);

  JWT_SECRET_USER_LOGIN = toString(E.JWT_SECRET_USER_LOGIN, 'JWT_SECRET_USER_LOGIN');

  DIR_DATA = toPath(E.DIR_DATA, './data');
  DIR_TEMP = toPath(E.DIR_TEMP, './temp');

  // LOCAL_FILES
  LOCAL_FILES_CACHE_MIN_THUMB_LOG_SIZE = toInt(E.LOCAL_FILES_CACHE_MIN_THUMB_LOG_SIZE, 5);
  LOCAL_FILES_IMAGE_MAX_SIZE = toInt(E.LOCAL_FILES_IMAGE_MAX_SIZE, 1024 * 1024 * 8); // 8mb
  LOCAL_FILES_ALLOW_MIME_TYPES = toArrayStrings(E.LOCAL_FILES_ALLOW_MIME_TYPES, ',', ['image/jpeg', 'image/png']);
  LOCAL_FILES_AUDIO_MAX_SIZE = toInt(E.LOCAL_FILES_AUDIO_MAX_SIZE, 1024 * 1024 * 20); // 20mb
  LOCAL_FILES_AUDIO_ALLOW_MIME_TYPES = toArrayStrings(E.LOCAL_FILES_AUDIO_ALLOW_MIME_TYPES, ',', ['audio/mp3']);
  LOCAL_FILES_VIDEO_MAX_SIZE = toInt(E.LOCAL_FILES_VIDEO_MAX_SIZE, 1024 * 1024 * 20); // 20mb
  LOCAL_FILES_VIDEO_ALLOW_MIME_TYPES = toArrayStrings(E.LOCAL_FILES_VIDEO_ALLOW_MIME_TYPES, ',', ['video/mp4']);

  isDevEnv() {
    return this.NODE_ENV === NodeEnvType.development;
  }

  isMasterNode() {
    return this.NODE_ROLE === NodeRole.MASTER;
  }

  private getBaseProtocol(protocol: Protocol) {
    if (protocol === Protocol.http) {
      return 'http:';
    } else {
      return 'https:';
    }
  }

  getNodeProtocol() {
    return this.getBaseProtocol(this.NODE_PROTOCOL);
  }
}

export function getDefaultEnv() {
  onlyDefault = true;
  const defaultEnv = new Env();
  onlyDefault = false;
  return defaultEnv;
}

export function toString(envParam: string | undefined, defaultValue: string) {
  if (onlyDefault) {
    return defaultValue;
  }
  return envParam ? envParam : defaultValue;
}

export function toInt(envParam: string | undefined, defaultValue: number, isIncrement = false) {
  let resValue = 0;

  if (envParam) {
    const tmp = parseInt(envParam);
    if (Number.isInteger(tmp)) {
      resValue = tmp;
    } else {
      resValue = defaultValue;
    }
  } else {
    resValue = defaultValue;
  }

  if (onlyDefault) {
    resValue = defaultValue;
  }

  if (isIncrement) {
    resValue += NODE_APP_INDEX;
  }

  return resValue;
}

export function toBool(envParam: string | undefined, defaultValue: boolean) {
  if (onlyDefault) {
    return defaultValue;
  }
  if (envParam === '0' || envParam === 'false') {
    return false;
  } else if (envParam === '1' || envParam === 'true') {
    return true;
  } else {
    return defaultValue;
  }
}

export function toEnum(envParam: string | undefined, enumValues: string[], defaultValue: string) {
  if (onlyDefault) {
    return defaultValue;
  }
  return envParam && enumValues.indexOf(envParam) >= 0 ? envParam : defaultValue;
}

export function toArrayStrings(envParam: string | undefined, spliter: string, defaultValue: string[]) {
  if (onlyDefault) {
    return defaultValue;
  }
  if (envParam) {
    try {
      const values = envParam.split(spliter);
      return values;
    } catch (error) {}
  }
  return defaultValue;
}

export function _parsePath(pathParam: string) {
  if (pathParam.startsWith('./') || pathParam.startsWith('../')) {
    return path.resolve(process.cwd(), pathParam);
  } else if (pathParam.startsWith('/')) {
    return pathParam;
  } else {
    return null;
  }
}
export function toPath(envParam: string | undefined, defaultPathValue: string) {
  if (onlyDefault) {
    return defaultPathValue;
  }

  let path = '' as string | null;

  if (envParam) {
    const tmp = _parsePath(envParam);
    if (tmp) {
      path = tmp;
    } else {
      path = _parsePath(defaultPathValue);
    }
  } else {
    path = _parsePath(defaultPathValue);
  }

  if (!path) {
    throw new Error('path is null');
  }

  const NAI = NODE_APP_INDEX.toString();
  const NAT = NODE_APP_TYPE;
  const NAF = NAT + '_' + NAI;

  path = path.replaceAll('{NAI}', NAI);
  path = path.replaceAll('{NAT}', NAT);
  path = path.replaceAll('{NAF}', NAF);

  return path;
}

const env = new Env();
export function useEnv() {
  return env;
}
