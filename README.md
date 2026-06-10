# use.a.r.t - MVP de e-commerce próprio

## Resumo

Loja React/Vite da use.a.r.t com catálogo real, seleção de cor e tamanho, carrinho persistente, checkout interno e finalização de pedido pelo WhatsApp da loja.

O projeto é um MVP estático para validar uma experiência de compra direta sem depender ainda de backend próprio.

## Funcionalidades

- Catálogo de produtos com filtros, busca e ordenação.
- Seleção de cor, tamanho e quantidade.
- Carrinho persistido no navegador.
- Checkout interno com contato, entrega, pagamento e revisão.
- Geração de mensagem estruturada para WhatsApp.
- Admin local simples para manutenção do catálogo no MVP.

## Stack

- React
- Vite
- CSS
- localStorage
- Render Static Site

## Como rodar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

## Variáveis de ambiente

```env
VITE_ADMIN_DEMO_PASSWORD=defina_uma_senha_local_para_demo
```

Como toda variável `VITE_`, esse valor é embutido no frontend e pode ser inspecionado no navegador. Use apenas como senha de demonstração local, nunca como segredo real.

## Como testar

```bash
npm run build
```

## Deploy

- Plataforma: Render
- Tipo: Static Site
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Node: `22`

## Segurança / Limitações

- Admin local não é autenticação real.
- A variável `VITE_ADMIN_DEMO_PASSWORD` fica exposta no bundle do frontend.
- Dados do catálogo ficam no `localStorage` do navegador.
- Imagens e produtos devem migrar para backend/storage em produção.
- Checkout finaliza via WhatsApp e depende de conferência manual da loja.

## Admin local

Clique no ícone de usuário no topo e use a senha definida em `VITE_ADMIN_DEMO_PASSWORD`.

O admin local é uma proteção simples para manutenção do catálogo no MVP estático. Não deve ser tratado como autenticação segura. Em produção, substituir por backend com autenticação real, banco de dados e storage de imagens.

## Checkout

O cliente preenche contato, entrega e pagamento, revisa o pedido e finaliza pelo WhatsApp. A mensagem gerada inclui número do pedido, dados do cliente, endereço, itens, frete, pagamento e total.

## Próximos passos

- Substituir o admin local por autenticação real.
- Persistir catálogo, pedidos e imagens em backend/storage.
- Criar área de pedidos para acompanhamento da operação.
- Revisar regras de frete e pagamento com dados reais da loja.
