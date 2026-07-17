# Decisões técnicas e comerciais

## Arquitetura

- Next.js App Router dinâmico hospedado na Vercel.
- Supabase Postgres/Auth/Storage, sem ORM; SQL migrations são a fonte de verdade.
- `@supabase/ssr` para sessão em cookies e `proxy.ts` para atualização de token.
- A autorização de páginas e ações administrativas será confirmada no servidor por identidade autenticada e registro em `admin_profiles`; cookie não é autorização.
- Server Components para leitura e Route Handlers/Server Actions para mutações.
- Zod valida fronteiras HTTP, env e comandos de domínio.
- Inteiros em centavos para valores monetários; nunca confiar em total vindo do cliente.

## Pagamentos

- Checkout Pro do Mercado Pago com SDK oficial fixado em versão exata.
- Uma preferência por tentativa de pagamento, vinculada ao pedido por identificador externo.
- O site nunca captura cartão.
- Webhook valida `x-signature`, `x-request-id` e `data.id` com o validador oficial, registra o evento antes do processamento e consulta o recurso na API antes de mudar estado.
- O fake provider é permitido somente em teste e ambientes não-live; configuração live com fake deve falhar.
- Pagamentos ficam desativados até existirem credenciais de teste verificadas.

## Operação comercial

- Catálogo inicial de sete produtos conforme seed aprovado.
- Produção predominantemente sob encomenda, prazo provisório de até dez dias úteis.
- Retirada gratuita e entrega em Campo Grande/MS por R$ 10; outras localidades exigem cotação manual antes do pagamento.
- `PRIMEIRACOMPRA`: seed de staging com 10%, uma utilização após pagamento aprovado por contato normalizado e `review_required=true`; não ativar live sem confirmação.
- WhatsApp permanece suporte/fallback, não banco de pedidos.

## Segurança

- Signup público desativado; administradores são provisionados por fluxo controlado.
- Secret key do Supabase e token do Mercado Pago são server-only.
- RLS habilitada em toda tabela exposta e policies mínimas por papel.
- Bucket de produto aceita apenas imagens, limite pequeno e escrita administrativa.
- Tokens públicos de pedido são aleatórios, armazenados como hash e comparados no servidor.
- Logs não contêm tokens, cookies, dados de cartão ou secrets.

## Deploy

- A migração ocorre em branch e Draft PR.
- Sem merge antes de Vercel Preview saudável.
- Render não será removido; continuará servindo a versão estática até cutover explícito.
- Nível A é implementação local, Nível B é staging e Nível C é produção comercial. Os termos não são intercambiáveis.

## Referências oficiais consultadas

- Supabase SSR, RLS e Storage Access Control;
- Next.js App Router e limitações de static export;
- Vercel deployment environments;
- Mercado Pago Checkout Pro, preferência server-side e validação oficial de Webhooks.
