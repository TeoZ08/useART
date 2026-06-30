import 'server-only';

import { getSiteUrl } from '@/lib/env';

export function hasTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  try {
    return new URL(origin).origin === getSiteUrl().origin;
  } catch {
    return false;
  }
}
