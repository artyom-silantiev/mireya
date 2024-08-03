import { Hono } from 'hono';
import { FileRequest } from './file-request.class';
import type { FileMeta } from './types';
import type { FilesOutputService } from './files-output.service';
import { createReadStream } from 'fs';

export function createFilesHono(filesOutput: FilesOutputService) {
  function parseUid(uidParam: string, query: { [key: string]: string }) {
    let fileRefRequest!: FileRequest;

    let match = uidParam.match(/^([0-9a-fA-Z]*)(\.(\w+))$/);
    if (match) {
      const uid = match[1];
      fileRefRequest = new FileRequest(uid);
      fileRefRequest.format = match[3];
    }

    match = uidParam.match(/^([0-9a-fA-Z]*)(\:(\d+))?$/);
    if (!fileRefRequest && match) {
      const uid = match[1];

      fileRefRequest = new FileRequest(uid);

      if (match[3]) {
        const temp = match[3];
        if (!Number.isNaN(temp)) {
          fileRefRequest.thumb = {
            type: 'width',
            name: temp,
          };
        }
      }
    }

    match = uidParam.match(/^([0-9a-fA-Z]*)(\:(fullhd))?$/);
    if (!fileRefRequest && match) {
      const uid = match[1];
      fileRefRequest = new FileRequest(uid);
      if (match[3]) {
        fileRefRequest.thumb = {
          type: 'name',
          name: match[3],
        };
      }
    }

    if (!fileRefRequest) {
      fileRefRequest = new FileRequest(uidParam);
    }

    if (query.w) {
      fileRefRequest.thumb = {
        type: 'width',
        name: query.w,
      };
    } else if (query.n) {
      fileRefRequest.thumb = {
        type: 'name',
        name: query.n,
      };
    }

    return fileRefRequest;
  }

  function getFileRefByUidAndArgsAndQuery(
    uid: string,
    args: string,
    query: { [key: string]: string },
  ) {
    const fileRequest = new FileRequest(uid);

    const match = args.match(/^(image|video)(\.(\w+))?$/);
    if (match) {
      fileRequest.type = match[1] as 'image' | 'video';
      if (match[3]) {
        fileRequest.format = match[3];
      }
    }

    if (query.w) {
      fileRequest.thumb = {
        type: 'width',
        name: query.w,
      };
    } else if (query.n) {
      fileRequest.thumb = {
        type: 'name',
        name: query.n,
      };
    }

    return fileRequest;
  }

  function getHeadersForFile(fileDbMeta: FileMeta) {
    return {
      'Cache-Control': 'public, immutable',
      'Content-Type': fileDbMeta.mime,
      'Content-Length': fileDbMeta.size.toString(),
      'Last-Modified': new Date(fileDbMeta.createdAt).toUTCString(),
      ETag: fileDbMeta.sha256,
    };
  }

  async function getFileResByUidAndQuery(
    uid: string,
    query: { [key: string]: string },
  ) {
    const fileRefRequest = parseUid(uid, query);
    const fileRes =
      await filesOutput.getFileDbPathByFileRefRequest(fileRefRequest);
    return fileRes;
  }

  async function getFileResByUidArgsQuery(
    uid: string,
    args: string,
    query: { [key: string]: string },
  ) {
    const filesRequest = getFileRefByUidAndArgsAndQuery(uid, args, query);
    const fileRes =
      await filesOutput.getFileDbPathByFileRefRequest(filesRequest);
    return fileRes;
  }

  return new Hono()
    .on('head', '/:uid', async (c) => {
      const fileRes = await getFileResByUidAndQuery(
        c.req.param('uid'),
        c.req.query(),
      );

      const ipfsCacheItemHeaders = getHeadersForFile(fileRes.fileMeta);
      return new Response('', {
        status: fileRes.status,
        headers: ipfsCacheItemHeaders,
      });
    })
    .get('/:uid', async (c) => {
      const fileRes = await getFileResByUidAndQuery(
        c.req.param('uid'),
        c.req.query(),
      );

      const ipfsCacheItemHeaders = getHeadersForFile(fileRes.fileMeta);
      const readStream = createReadStream(fileRes.fileMeta.absPathToFile);
      return new Response(readStream, {
        status: fileRes.status,
        headers: ipfsCacheItemHeaders,
      });
    })
    .on('head', '/:uid/:args', async (c) => {
      const fileRes = await getFileResByUidArgsQuery(
        c.req.param('uid'),
        c.req.param('args'),
        c.req.query(),
      );

      const ipfsCacheItemHeaders = getHeadersForFile(fileRes.fileMeta);
      return new Response('', {
        status: fileRes.status,
        headers: ipfsCacheItemHeaders,
      });
    })
    .get('/:uid/:args', async (c) => {
      const fileRes = await getFileResByUidArgsQuery(
        c.req.param('uid'),
        c.req.param('args'),
        c.req.query(),
      );

      const ipfsCacheItemHeaders = getHeadersForFile(fileRes.fileMeta);
      const readStream = createReadStream(fileRes.fileMeta.absPathToFile);
      return new Response(readStream, {
        status: fileRes.status,
        headers: ipfsCacheItemHeaders,
      });
    });
}
