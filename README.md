# ART - Loja própria

## Resumo

Loja própria da ART com catálogo oficial, seleção de variações, carrinho local transitório, checkout assistido e preparação de pedido pelo WhatsApp da loja.

Esta fase transforma o antigo MVP estático em uma base de produção honesta: sem admin falso, sem frete simulado, sem meio de pagamento anunciado como integrado e sem credenciais fictícias.

## Direção visual

O storefront usa a direção **editorial técnico monocromático**: Barlow Condensed para narrativa e títulos, Manrope para interface, fundo papel quente, preto profundo e cinzas minerais. A home organiza campanha, seleção de produto, função, Kit, catálogo e operação de compra sem esconder regras comerciais.

Os derivados transparentes aprovados vivem em `public/assets/products/cutouts/`. Preto e marrom são usados em hero, seleção, páginas de produto e Kit. Peças branco/off-white mantêm o original e `cutoutStatus: 'needs-review'` até receberem recorte manual de qualidade.

## Funcionalidades

- Catálogo com exatamente sete ofertas comerciais confirmadas.
- Páginas individuais de produto.
- Seleção de cor, tamanho e quantidade.
- Kit Seleção com três configurações independentes.
- Carrinho persistido no navegador.
- Cupom `PRIMEIRACOMPRA` com 10% de desconto transitório.
- Entrega com retirada ART, Campo Grande/MS por R$ 10 e demais localidades a confirmar.
- Checkout assistido com contato, entrega, revisão e mensagem estruturada para WhatsApp.

## Stack

- React
- Next.js App Router
- TypeScript
- CSS Modules e CSS global
- localStorage
- Vitest
- Playwright
- Render Static Site

## Como rodar localmente

```bash
npm ci
npm run dev
```

## Variáveis de ambiente

Nenhuma variável de ambiente é necessária na Fase 1. O admin local por `VITE_` foi removido.

## Como testar

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Revisão visual

Com o servidor local em execução, gere as capturas e a verificação de overflow:

```bash
npm run dev
node scripts/design/capture-review.mjs
```

As capturas estão em `docs/design-review/before/` e `docs/design-review/after/`. A comparação está em `docs/design-review/REVIEW.md`.

## Deploy

- Plataforma: Render
- Tipo: Static Site
- Build Command: `npm ci && npm run build`
- Publish Directory: `out`
- Node: `22`

O Next.js está configurado com `output: 'export'`, `trailingSlash: true` e imagens não otimizadas no runtime para gerar uma saída estática compatível com Render.

O `postbuild` também espelha `out` para `dist` como compatibilidade temporária com o serviço Render existente, caso o dashboard ainda esteja com o Publish Directory antigo. A saída canônica nova é `out`.

## Segurança / Limitações

- Não existe admin nesta fase.
- Carrinho e cupom ficam no `localStorage` do navegador.
- Validação definitiva de cupom precisa ocorrer no servidor.
- Pedido não é confirmado no site; a mensagem precisa ser enviada pelo usuário no WhatsApp.
- Pagamento, produção e entrega dependem de conferência manual da loja.
- Imagens pendentes usam placeholder explícito.

## Catálogo oficial

- Moletom ART — R$ 109,90.
- Camiseta Híbrida — logo lateral — R$ 45,00.
- Camiseta Híbrida — logo central — R$ 45,00.
- Camiseta Híbrida — assinatura lateral — R$ 45,00.
- Kit Seleção — 3 camisetas — R$ 114,90.
- Camiseta Solid Masculina — logo central — R$ 50,00.
- Camiseta Solid Masculina — assinatura lateral — R$ 50,00.

## Checkout

O cliente preenche contato e entrega, revisa itens, desconto, frete e total estimado, e clica em `Abrir pedido no WhatsApp`. Depois disso, o site informa que a mensagem foi preparada e que o usuário precisa enviá-la no WhatsApp para concluir a solicitação.

## Próximos passos

- Criar backend com Supabase Auth, Postgres e Storage.
- Integrar Mercado Pago Checkout Pro com credenciais reais.
- Implementar regras server-side de cupom, pedidos, frete e status.
- Completar imagens, composição, medidas, políticas e textos jurídicos.
- Finalizar o recorte manual das peças branco/off-white e receber fotografias reais com pessoas.
