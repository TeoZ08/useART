# Migração para base de produção

## Arquitetura entregue

```text
app/
  layout.tsx
  page.tsx
  produto/[slug]/page.tsx
  carrinho/page.tsx
  checkout/page.tsx
  privacidade/page.tsx
  termos/page.tsx
  trocas/page.tsx
  entrega/page.tsx
  contato/page.tsx
components/
  layout/
  home/
  catalog/
  product/
  cart/
  checkout/
  ui/
domain/
  products/
  cart/
  coupon/
  shipping/
  orders/
data/
  catalog.seed.ts
lib/
  config.ts
  money.ts
  whatsapp.ts
  validation.ts
types/
docs/
tests/
```

## Decisões técnicas

- Next.js App Router substitui Vite.
- TypeScript estrito substitui JavaScript.
- CSS Modules organizam componentes, e `app/globals.css` mantém tokens e estilos base.
- Dependências estão fixadas com versões explícitas.
- Vitest cobre domínio.
- Playwright cobre fluxo crítico de compra assistida.
- `localStorage` permanece apenas como persistência transitória atrás de `CartRepository`.
- Next.js exporta saída estática em `out` para manter compatibilidade com Render Static Site.

## Contratos preparados

- `ShippingQuoteProvider`: pronto para trocar a implementação estática por cotação real.
- `CartRepository`: pronto para substituir `localStorage` por estado autenticado ou backend.
- `domain/coupon`: cupom centralizado e testável, com nota de validação server-side.
- `AssistedOrder`: contrato inicial para pedido assistido, pronto para persistência futura.
- `STORE_CONFIG`: contato e identidade centralizados.
- `render.yaml`: Blueprint estático com `npm ci && npm run build` e `staticPublishPath: ./out`.

## Fase 2 recomendada

- Criar backend com Supabase Auth, Postgres e Storage.
- Persistir produtos, imagens, pedidos e status.
- Criar painel admin autenticado.
- Integrar Mercado Pago Checkout Pro com credenciais reais.
- Implementar validação server-side de cupom.
- Implementar cálculo real de frete ou tabela comercial aprovada.
- Criar política jurídica revisada para privacidade, termos, trocas e entrega.
