import 'server-only';

import { getServerEnv } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

export type AdminRole = 'owner' | 'admin' | 'operator';
export type AdminContext = {
  userId: string;
  email?: string;
  displayName: string;
  role: AdminRole;
  aal: string;
};

export class AdminAuthorizationError extends Error {}

export async function requireAdmin(
  allowedRoles: readonly AdminRole[] = ['owner', 'admin', 'operator'],
  options: { enforceMfa?: boolean } = {},
): Promise<AdminContext> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const userId = typeof claims?.sub === 'string' ? claims.sub : undefined;
  if (claimsError || !userId) throw new AdminAuthorizationError('Sessão administrativa inválida.');

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('display_name, role, active')
    .eq('user_id', userId)
    .eq('active', true)
    .single();
  if (profileError || !profile) throw new AdminAuthorizationError('Perfil administrativo inativo.');
  const role = profile.role as AdminRole;
  if (!allowedRoles.includes(role)) throw new AdminAuthorizationError('Permissão insuficiente.');

  const aal = typeof claims?.aal === 'string' ? claims.aal : 'aal1';
  const env = getServerEnv();
  if (
    options.enforceMfa !== false &&
    env.STORE_MODE === 'live' &&
    ['owner', 'admin'].includes(role) &&
    aal !== 'aal2'
  ) {
    throw new AdminAuthorizationError('MFA é obrigatório para administração em live.');
  }

  return {
    userId,
    email: typeof claims?.email === 'string' ? claims.email : undefined,
    displayName: profile.display_name,
    role,
    aal,
  };
}
