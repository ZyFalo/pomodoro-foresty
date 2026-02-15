import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from '@/types';
import { JWT_EXPIRY } from '@/lib/utils/constants';

const secret = new TextEncoder().encode(process.env.SECRET_KEY!);

export async function createToken(payload: { userId: string; role: 'user' | 'admin' }): Promise<string> {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as JWTPayload;
}
