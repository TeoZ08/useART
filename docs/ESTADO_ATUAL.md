# Estado atual da Fase 1

## Auditoria inicial

- Branch inicial: `main`.
- Último commit auditado: `498fff8 Corrige admin local e documenta MVP useART`.
- Remote: `origin https://github.com/TeoZ08/useART.git`.
- Estado do Git antes da execução: limpo.
- Stack anterior: React/Vite em JavaScript, CSS global e aplicação concentrada em `src/main.jsx` e `src/styles.css`.

## Preservado

- Assets válidos em `public/assets`.
- Identidade escura/minimalista, com preto, off-white, branco, cinza e apoio marrom.
- Fluxos úteis de catálogo, seleção, carrinho e checkout via WhatsApp.
- CNPJ, localização em Campo Grande/MS e handle `@use.a.r.t`.

## Removido

- Vite e `latest` no `package.json`.
- Monólito em `src/main.jsx`.
- Admin local com senha `VITE_ADMIN_DEMO_PASSWORD`.
- Fretes fictícios de Correios/Jadlog.
- Cartão, boleto, bandeiras e Mercado Pago apresentados como integrados.
- Mensagens que declaravam pedido enviado/concluído antes do envio pelo WhatsApp.
- WhatsApp incorreto `556791691441`.

## Migrado

- Aplicação para Next.js App Router com TypeScript estrito.
- Dados para `data/catalog.seed.ts`.
- Domínio para `domain/products`, `domain/cart`, `domain/coupon`, `domain/shipping` e `domain/orders`.
- UI para componentes em `components/*` com CSS Modules e CSS global.
- Checkout para uma página assistida e honesta.

## Bloqueios e limites

- Sem backend nesta fase.
- Sem Supabase, Mercado Pago, ORM, filas ou storage.
- Carrinho e cupom continuam transitórios no navegador.
- Validação definitiva de cupom, estoque, pedido e status depende de servidor.
- Imagens, textos jurídicos, composição, medidas e regras comerciais completas continuam pendentes.
