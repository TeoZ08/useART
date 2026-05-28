# use.a.r.t — Protótipo React

Protótipo de vitrine/e-commerce em React para a marca use.a.r.t.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra a URL exibida no terminal.

## Build

```bash
npm run build
npm run preview
```

## Deploy no Render

1. Suba este projeto para um repositório no GitHub.
2. No Render, clique em **New +** > **Static Site**.
3. Conecte o repositório.
4. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Clique em **Create Static Site**.

## Painel administrativo do protótipo

No topo do site, clique no ícone de usuário.

Senha do protótipo: `useart2026`

O painel salva produtos no `localStorage` do navegador. Isso serve para demonstração visual. Para produção real, o próximo passo é trocar esse armazenamento por Supabase/PostgreSQL + autenticação segura.

## Observação de segurança

Este protótipo não processa pagamento. Os botões de compra apontam para a loja atual na Nuvemshop, mantendo o checkout fora do protótipo.
