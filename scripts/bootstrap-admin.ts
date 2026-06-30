import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
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
    const { data, error } = await client.auth.admin.inviteUserByEmail(email);
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
