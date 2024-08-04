import { useEnv } from '~/lib/env/env';
import { sign, verify } from 'hono/jwt';
import { TRPCError } from '@trpc/server';
import { usePrisma } from './prisma';
import { type User, type UserRole } from '@prisma/client';
import { useRedis } from './redis';

const prisma = usePrisma();
const env = useEnv();
const redis = useRedis();

export class JtwAuth {
  constructor(
    public userId: bigint,
    public userRole: UserRole,
  ) {}
}

export type JtwAuthPayload = {
  t: 'A' | 'R'; // A = access, R = refresh
  id: string;
  exp: number;
};

export type JwtAuthData = {
  userId: string;
  userRole: UserRole;
};

class JtwAuthCacheService {
  private redisCacheKeyPrefix = 'jwt';

  key(jwtId: string) {
    return `${this.redisCacheKeyPrefix}:${jwtId}`;
  }

  async get(jwtId: string) {
    const key = this.key(jwtId);
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data) as JwtAuthData;
    }
    return null;
  }

  async set(jwtId: string, data: JwtAuthData) {
    const key = this.key(jwtId);
    await redis.set(key, JSON.stringify(data), 'EX', 600);
  }

  async del(jwtId: string) {
    const key = this.key(jwtId);
    await redis.del(key);
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

  const expAccess = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24h
  const expAccessDateTime = new Date(expAccess * 1000);
  const expRefresh = Math.floor(Date.now() / 1000) + 60 * 60 * 72; // 72h
  const expRefreshDateTime = new Date(expRefresh * 1000);

  const jwtAuth = await prisma.jwtAuth.create({
    data: {
      userRole,
      userId: user.id,
      accessExp: expAccessDateTime,
      refreshExp: expRefreshDateTime,
    },
  });

  const accessToken = await sign(
    {
      t: 'A',
      id: jwtAuth.id.toString(),
      exp: expAccess,
    } as JtwAuthPayload,
    env.JWT_SECRET_USER_AUTH,
  );

  const refreshToken = await sign(
    {
      t: 'R',
      id: jwtAuth.id.toString(),
      exp: expRefresh,
    } as JtwAuthPayload,
    env.JWT_SECRET_USER_AUTH,
  );

  return { accessToken, expAccessDateTime, refreshToken, expRefreshDateTime };
}

export async function verifyAccessToken(accessToken: string) {
  let payload!: JtwAuthPayload;
  try {
    payload = (await verify(
      accessToken,
      env.JWT_SECRET_USER_AUTH,
    )) as JtwAuthPayload;
  } catch (error) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'bad token',
    });
  }

  if (payload.t !== 'A') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'bad access token',
    });
  }

  let jwtData = await jwtAuthCacheService.get(payload.id);
  if (!jwtData) {
    const jwtAuth = await prisma.jwtAuth.findFirst({
      where: {
        id: BigInt(payload.id),
      },
    });

    if (!jwtAuth) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'token not found',
      });
    }

    jwtData = {
      userRole: jwtAuth.userRole,
      userId: jwtAuth.userId.toString(),
    };

    await jwtAuthCacheService.set(payload.id, jwtData);
  }

  const jtwUserPayload = new JtwAuth(BigInt(jwtData.userId), jwtData.userRole);

  return jtwUserPayload;
}

export async function useRefreshToken(refreshToken: string) {
  let payload!: JtwAuthPayload;
  try {
    payload = (await verify(
      refreshToken,
      env.JWT_SECRET_USER_AUTH,
    )) as JtwAuthPayload;
  } catch (error) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'bad token',
    });
  }

  if (payload.t !== 'R') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'bad refresh token',
    });
  }

  const tmpExp = payload.exp - Math.floor(Date.now() / 1000);
  if (tmpExp > 60 * 60 * 60) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'too early for use refresh ',
    });
  }

  const jwtAuth = await prisma.jwtAuth.findFirst({
    where: {
      id: BigInt(payload.id),
    },
    include: {
      user: true,
    },
  });

  if (!jwtAuth) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'token not found',
    });
  }

  const newAuthTokens = await createAuthTokens(jwtAuth.user, jwtAuth.userRole);

  // delete old jwt auth
  await prisma.jwtAuth.delete({
    where: {
      id: jwtAuth.id,
    },
  });
  await jwtAuthCacheService.del(jwtAuth.id.toString());

  return newAuthTokens;
}
