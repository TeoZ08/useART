# Checklist de variáveis Production

Use esta lista por **nome e estado**, sem copiar valores para tickets, logs ou commits. Em 8 de julho de 2026, a auditoria da Vercel encontrou as variáveis abaixo somente no Preview; Production permanece sem configuração e não foi alterada.

## Base obrigatória antes do merge

| Variável                               | Production | Ação                                      |
| -------------------------------------- | ---------- | ----------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | ausente    | definir como origem pública final         |
| `NEXT_PUBLIC_SUPABASE_URL`             | ausente    | definir com o projeto Production aprovado |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ausente    | definir com a chave pública Production    |
| `SUPABASE_SECRET_KEY`                  | ausente    | definir como secret server-only           |
| `SUPABASE_PROJECT_REF`                 | ausente    | definir com o projeto Production          |
| `ADMIN_BOOTSTRAP_EMAIL`                | ausente    | definir como secret server-only           |
| `ORDER_TOKEN_PEPPER`                   | ausente    | gerar valor exclusivo de Production       |
| `CUSTOMER_HASH_PEPPER`                 | ausente    | gerar valor exclusivo de Production       |

Não reutilize peppers de staging. Não exponha `SUPABASE_SECRET_KEY`, e-mails administrativos ou peppers ao navegador.

## Pagamento live

Só configurar depois do deploy público validado com pagamentos desativados.

| Variável                      | Valor/estado exigido                             |
| ----------------------------- | ------------------------------------------------ |
| `PAYMENT_PROVIDER`            | `mercadopago`                                    |
| `PAYMENTS_ENABLED`            | `true`, apenas na janela de ativação             |
| `MERCADO_PAGO_ENVIRONMENT`    | `live`                                           |
| `MERCADO_PAGO_ACCESS_TOKEN`   | credencial live server-only                      |
| `MERCADO_PAGO_WEBHOOK_SECRET` | assinatura live server-only                      |
| `MERCADO_PAGO_WEBHOOK_URL`    | URL HTTPS do domínio live, sem bypass de Preview |

Antes da janela, mantenha `PAYMENTS_ENABLED=false`. Nunca copie credenciais de teste para Production.

## Gates de loja

- `STORE_MODE=live` no ambiente Vercel;
- `store_settings.store_mode=live` no banco Production;
- `store_settings.payments_enabled=true` somente após webhook live validado.

O ambiente e o banco precisam concordar. Uma flag desativada deve bloquear o pagamento.

## Estado temporário seguro

Enquanto os gates live não forem aprovados:

- `STORE_MODE=staging`;
- `PAYMENTS_ENABLED=false`;
- `PAYMENT_PROVIDER=fake`, ou `mercadopago` com pagamentos desativados;
- `NATIONAL_CHECKOUT_ENABLED=false`.

Depois de configurar, confirme apenas presença e escopo com `vercel env ls`. Não use `vercel env pull` e não imprima valores.
