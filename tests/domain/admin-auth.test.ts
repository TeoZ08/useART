import { describe, expect, it } from 'vitest';
import {
  getAuthConfirmationDestination,
  safeInternalPath,
} from '@/lib/auth/confirmation-destination';
import { validateAdminPassword } from '@/lib/auth/password-policy';

describe('admin auth confirmation', () => {
  it('routes invite and recovery sessions to the password form without tokens', () => {
    expect(getAuthConfirmationDestination('invite', '/admin')).toBe(
      '/admin/definir-senha?flow=invite',
    );
    expect(getAuthConfirmationDestination('recovery', '/admin')).toBe(
      '/admin/definir-senha?flow=recovery',
    );
  });

  it('keeps regular confirmation redirects internal', () => {
    expect(getAuthConfirmationDestination('email', '/admin/mfa')).toBe('/admin/mfa');
    expect(safeInternalPath('https://evil.example')).toBe('/admin');
    expect(safeInternalPath('//evil.example')).toBe('/admin');
  });
});

describe('admin password policy', () => {
  it('matches the Supabase minimum and complexity policy', () => {
    expect(validateAdminPassword('short', 'short')).toMatch(/12 caracteres/);
    expect(validateAdminPassword('onlylowercase123!', 'onlylowercase123!')).toMatch(/maiúsculas/);
    expect(validateAdminPassword('NoSymbolPassword1', 'NoSymbolPassword1')).toMatch(/símbolo/);
    expect(validateAdminPassword('StrongPassword1!', 'different')).toMatch(/não coincidem/);
    expect(validateAdminPassword('StrongPassword1!', 'StrongPassword1!')).toBeNull();
  });
});
