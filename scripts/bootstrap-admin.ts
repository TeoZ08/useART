import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
  VERCEL_URL: z.string().min(1).optional(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  ADMIN_BOOTSTRAP_EMAIL: z.email(),
});

async function main() {
  const env = envSchema.parse(process.env);
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const email = env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
  const { data: users, error: listError } = await client.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;
  let user = users.users.find((candidate) => candidate.email?.toLowerCase() === email);
  if (!user) {
    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : '');
    if (!siteUrl) {
      throw new Error('NEXT_PUBLIC_SITE_URL ou VERCEL_URL é obrigatória para enviar convite.');
    }
    const redirectTo = new URL('/admin/definir-senha?flow=invite', siteUrl).toString();
    const { data, error } = await client.auth.admin.inviteUserByEmail(email, { redirectTo });
    if (error) throw error;
    user = data.user;
  }
  const { error: profileError } = await client.from('admin_profiles').upsert({
    user_id: user.id,
    display_name: user.user_metadata?.display_name ?? 'Proprietário ART',
    role: 'owner',
    active: true,
  });
  if (profileError) throw profileError;
  console.log('Administrador bootstrap configurado sem senha hardcoded.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Falha no bootstrap administrativo.');
  process.exitCode = 1;
});
