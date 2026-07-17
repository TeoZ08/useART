# Ambiente local

Requisitos: Node 22, npm, Docker e Supabase CLI. Nunca copie credenciais de produção.

```bash
npm ci
cp .env.example .env.local
npm run db:start
npm run db:reset
npm run dev
```

Use `PAYMENT_PROVIDER=fake`, `PAYMENTS_ENABLED=false` e `STORE_MODE=local`. Ao encerrar: `npm run db:stop`.
