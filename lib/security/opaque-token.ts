import 'server-only';

import { createHmac, randomBytes } from 'node:crypto';

export function createOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function hashOpaqueValue(value: string, pepper: string): string {
  if (!value || !pepper) throw new Error('Token e pepper são obrigatórios.');
  return createHmac('sha256', pepper).update(value, 'utf8').digest('hex');
}

export function deriveOpaqueToken(value: string, pepper: string): string {
  if (!value || !pepper) throw new Error('Valor e pepper são obrigatórios.');
  return createHmac('sha256', pepper)
    .update(`public-token\u0000${value}`, 'utf8')
    .digest('base64url');
}
