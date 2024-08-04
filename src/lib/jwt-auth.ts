import { useEnv } from '~/lib/env/env';
import { sign, verify } from 'hono/jwt';
import { TRPCError } from '@trpc/server';
import { useBs58 } from './bs58';
import { usePrisma } from './prisma';
import { JwtType, type User, type UserRole } from '@prisma/client';
import { useRedis } from './redis';

const bs58 = useBs58();
const prisma = usePrisma();
const env = useEnv();
const redis = useRedis();

export class JtwAuth {
  constructor(
    public userId: bigint,
    public userRole: UserRole,
  ) {}
}

export type JtwAuthMetaData = {
  userRole: UserRole;
};

export type JtwAuthPayload = {
  t: 'A' | 'R'; // A = access, R = refresh
  u: string; // token uid
};

export type JwtAuthData = {
  userId: string;
  userRole: UserRole;
};

class JtwAuthCacheService {
  private redisCacheKeyPrefix = 'jwt';

  key(jwtType: JwtType, uid: string) {
    return `${this.redisCacheKeyPrefix}:${jwtType}:${uid}`;
  }

  async get(jwtType: JwtType, uid: string) {
    const key = this.key(jwtType, uid);
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data) as JwtAuthData;
    }
    return null;
  }

  async set(jwtType: JwtType, uid: string, data: JwtAuthData) {
    const key = this.key(jwtType, uid);
    await redis.set(key, JSON.stringify(data), 'EX', 600);
  }
}
const jwtAuthCacheService = new JtwAuthCacheService();

export async function createAuthTokens(user: User, userRole: UserRole) {
  const roleCheckAccess = user.roles.find((x) => x === userRole);

  if (!roleCheckAccess) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'no access to role',
    });
  }

  const tokensUid = bs58.uid();

  const expAccess = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24h
  const expAccessDateTime = new Date(expAccess * 1000);
  const expRefresh = Math.floor(Date.now() / 1000) + 60 * 60 * 72; // 72h
  const expRefreshDateTime = new Date(expRefresh * 1000);

  const jwtMeta = {
    userRole,
  } as JtwAuthMetaData;

  const accessJwt = await prisma.jwt.create({
    data: {
      type: JwtType.ACCESS_TOKEN,
      uid: tokensUid,
      userId: user.id,
      expirationAt: expAccessDateTime,
      meta: jwtMeta,
    },
  });

  const refreshJwt = await prisma.jwt.create({
    data: {
      type: JwtType.REFRESH_TOKEN,
      uid: tokensUid,
      userId: user.id,
      expirationAt: expRefreshDateTime,
      meta: jwtMeta,
    },
  });

  const accessToken = await sign(
    {
      t: 'A',
      u: accessJwt.uid,
      exp: expAccess,
    } as JtwAuthPayload,
    env.JWT_SECRET_USER_AUTH,
  );

  const refreshToken = await sign(
    {
      t: 'R',
      u: refreshJwt.uid,
      exp: expAccess,
    } as JtwAuthPayload,
    env.JWT_SECRET_USER_AUTH,
  );

  return { accessToken, expAccessDateTime, refreshToken, expRefreshDateTime };
}

export async function verifyAccessToken(accessToken: string) {
  const payload = (await verify(
    accessToken,
    env.JWT_SECRET_USER_AUTH,
  )) as JtwAuthPayload;

  if (payload.t !== 'A') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'bad access token',
    });
  }

  let jwtData = await jwtAuthCacheService.get(JwtType.ACCESS_TOKEN, payload.u);
  if (!jwtData) {
    const jwtAccess = await prisma.jwt.findFirst({
      where: {
        type: JwtType.ACCESS_TOKEN,
        uid: payload.u,
      },
    });

    if (!jwtAccess) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'token not found',
      });
    }

    const jwtMeta = jwtAccess.meta as JtwAuthMetaData;
    jwtData = {
      userId: jwtAccess.userId!.toString(),
      userRole: jwtMeta.userRole,
    };

    await jwtAuthCacheService.set(JwtType.ACCESS_TOKEN, payload.u, jwtData);
  }

  const jtwUserPayload = new JtwAuth(BigInt(jwtData.userId), jwtData.userRole);

  return jtwUserPayload;
}

export async function useRefreshToken(refreshToken: string) {
  const payload = (await verify(
    refreshToken,
    env.JWT_SECRET_USER_AUTH,
  )) as JtwAuthPayload;

  if (payload.t !== 'R') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'bad refresh token',
    });
  }

  const jwtRefresh = await prisma.jwt.findFirst({
    where: {
      type: JwtType.REFRESH_TOKEN,
      uid: payload.u,
    },
    include: {
      user: true,
    },
  });

  if (!jwtRefresh) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'token not found',
    });
  }

  const jwtMeta = jwtRefresh.meta as JtwAuthMetaData;

  const newAuthTokens = await createAuthTokens(
    jwtRefresh.user!,
    jwtMeta.userRole,
  );

  // delete old tokens
  await prisma.jwt.deleteMany({
    where: {
      uid: jwtRefresh.uid,
    },
  });

  return newAuthTokens;
}
