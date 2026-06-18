# ART - Loja própria

## Resumo

Loja própria da ART com catálogo oficial, seleção de variações, carrinho local transitório, checkout assistido e preparação de pedido pelo WhatsApp da loja.

Esta fase transforma o antigo MVP estático em uma base de produção honesta: sem admin falso, sem frete simulado, sem meio de pagamento anunciado como integrado e sem credenciais fictícias.

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
- Vercel como destino futuro

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

## Deploy

- Destino futuro: Vercel
- Build Command: `npm ci && npm run build`
- Node: `22`

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
