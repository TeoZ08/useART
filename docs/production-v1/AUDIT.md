# Auditoria inicial — Commerce Production V1

Data da auditoria: 30 de junho de 2026.

## Estado do repositório

- Branch de trabalho: `feat/commerce-production-v1`, criada a partir de `fb886d0`.
- Remoto: `origin` aponta para `TeoZ08/useART` no GitHub.
- A `main` preserva o site estático atual e o deploy legado do Render.
- A branch ainda contém `output: 'export'`, `images.unoptimized` e um `postbuild` que copia `out/` para `dist/`; esses itens precisam sair somente nesta branch.
- O catálogo inicial tem sete produtos em TypeScript e não possui persistência remota.
- Carrinho, cupom e checkout são client-side. O checkout abre WhatsApp e não cria pedido persistido.
- Não há painel administrativo, API de pagamento, webhook, migrations ou RLS implementados.
- Os assets e componentes da hero 3D existem e devem ser preservados sem alteração de geometria.

## Infraestrutura encontrada

- Node.js alvo preparado: 22.x (`.nvmrc` e `package.json#engines`).
- Supabase CLI 2.108.0 instalado no projeto e link remoto existente.
- Autenticação da CLI do Supabase: válida.
- Banco Supabase local: indisponível nesta sessão porque o daemon Docker não está acessível.
- Projeto Vercel existente: `useart` (`prj_mMxpYUHwq1Ybs6wGf81WfqY0F20R`).
- O projeto Vercel está classificado como `services`, usa Node 24.x, não possui deployment recente nem domínio; diverge do alvo Next.js/Node 22.
- GitHub CLI autenticada.

## Variáveis verificadas sem revelar valores

Presentes e não vazias: URL pública do Supabase, secret key do Supabase, referência do projeto, peppers de tokens, e-mail bootstrap, flags da loja e token OIDC da Vercel.

Ausentes ou vazias:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: ausente;
- `MERCADO_PAGO_ACCESS_TOKEN`: vazio;
- `MERCADO_PAGO_WEBHOOK_SECRET`: vazio.

As credenciais de Mercado Pago devem permanecer vazias enquanto `PAYMENTS_ENABLED=false`. Nenhum segredo foi impresso ou será versionado.

## Riscos prioritários

1. Preço, cupom, frete e estoque são hoje confiados ao navegador.
2. Não existe pedido durável nem trilha de eventos/idempotência.
3. A configuração inicial do Supabase permitia signup público e senha fraca; a configuração local foi endurecida nesta branch.
4. A migração dinâmica invalida o contrato do Render Static Site; o Render será mantido como legado e o cutover só ocorrerá após Preview funcional.
5. A chave publicável do Supabase e as credenciais de teste do Mercado Pago são gates externos para staging.
6. Sem Docker disponível, os testes locais de Postgres/RLS precisam ser executados em CI com serviço adequado ou após restauração do daemon.

## Baseline funcional a preservar

- identidade visual e catálogo de sete produtos;
- hero 3D e seus fallbacks responsivos;
- páginas públicas existentes;
- carrinho e fluxo assistido enquanto o novo checkout estiver desativado;
- configuração do Render e histórico da `main`.

Esta auditoria não declara o site pronto para produção. Ela estabelece o baseline para o Nível A.
