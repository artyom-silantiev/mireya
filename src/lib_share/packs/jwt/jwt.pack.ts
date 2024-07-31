import { useEnv } from '!src/lib_share/composables/env/env';
import jwt from 'jsonwebtoken';

export type JtwUserPayloadData = { userId: string };

export class JtwUserPayload {
  constructor(public userId: bigint) {}
}

const env = useEnv();

export function createToken(userId: string) {
  const token = jwt.sign(
    {
      userId,
    },
    env.JWT_SECRET_USER_LOGIN,
    {
      expiresIn: '24h',
    },
  );

  return token;
}

export async function verifyToken(token: string) {
  const payload = await new Promise<JtwUserPayloadData>((resolve, reject) => {
    jwt.verify(token, env.JWT_SECRET_USER_LOGIN, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data as JtwUserPayloadData);
      }
    });
  });

  const jtwUserPayload = new JtwUserPayload(BigInt(payload.userId));

  return jtwUserPayload;
}
