# Supabase

Vincule explicitamente o projeto de staging, confira o diff e só então aplique migrations aditivas:

```bash
npx supabase link --project-ref <STAGING_PROJECT_REF>
npx supabase migration list --linked
npx supabase db push --linked --dry-run
npx supabase db push --linked
npx supabase migration list --linked
```

Não use `db reset`, `db wipe`, `DROP` ou seed destrutivo remotamente. Rode `npm run db:reset && npm run db:test` localmente antes do push. Bucket e políticas são definidos nas migrations e devem passar pelos testes RLS.
