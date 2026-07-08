export type AdminEmailOtpType = 'email' | 'invite' | 'magiclink' | 'recovery' | 'email_change';

export function safeInternalPath(path: string): string {
  return path.startsWith('/') && !path.startsWith('//') ? path : '/admin';
}

export function getAuthConfirmationDestination(type: AdminEmailOtpType, next: string): string {
  if (type === 'invite' || type === 'recovery') {
    return `/admin/definir-senha?flow=${type}`;
  }

  return safeInternalPath(next);
}
