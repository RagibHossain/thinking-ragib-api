import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import { jwtConfig } from '../config/oauth';

export function generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    jwtConfig.secret,
    { expiresIn: jwtConfig.accessTokenExpiry }
  );
}

export function generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    jwtConfig.secret,
    { expiresIn: jwtConfig.refreshTokenExpiry }
  );
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, jwtConfig.secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function verifyRefreshToken(token: string): JWTPayload {
  const payload = verifyToken(token);
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
}

