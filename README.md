# use.a.r.t - MVP de e-commerce próprio

Loja React/Vite da use.a.r.t com catálogo real, seleção de cor e tamanho, carrinho persistente, checkout interno e finalização de pedido pelo WhatsApp da loja.

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
- Node: `22`

## Admin local

Clique no ícone de usuário no topo.

Senha: `useart2026`

O admin salva produtos no `localStorage` do navegador e serve apenas para manutenção local do catálogo neste MVP. Em produção, substitua por backend com autenticação, banco de dados e storage de imagens.

## Checkout

O cliente preenche contato, entrega e pagamento, revisa o pedido e finaliza pelo WhatsApp. A mensagem gerada inclui número do pedido, dados do cliente, endereço, itens, frete, pagamento e total.
