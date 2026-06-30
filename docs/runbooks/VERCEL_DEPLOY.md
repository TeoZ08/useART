# Deploy Vercel

O Preview deve usar somente variáveis de staging no escopo Preview. Não reutilize Supabase local nem configure Mercado Pago live.

```bash
npx vercel pull --yes --environment=preview
npx vercel deploy
```

Confirme `STORE_MODE=staging`, `PAYMENTS_ENABLED=false` e `PAYMENT_PROVIDER=fake`. Rode smoke tests sobre a URL imutável do deployment antes de promover. Produção exige checklist e aprovação explícita.
