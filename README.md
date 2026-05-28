# use.a.r.t — protótipo de e-commerce próprio

Protótipo React/Vite da loja use.a.r.t com catálogo real, carrinho, checkout simulado, métodos de entrega, formas de pagamento e painel admin demonstrativo.

## Rodar localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

## Deploy no Render

- Tipo: Static Site
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

## Admin demo

Clique no ícone de usuário no topo.

Senha: `useart2026`

Observação: o admin é somente demonstrativo e salva dados no `localStorage`. Em produção, substituir por backend real com autenticação, banco e storage.

## Checkout

O fluxo de checkout é visual/simulado. Em produção, deve ser integrado a gateway de pagamento por backend seguro.
