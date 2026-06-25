# Estado atual da Fase 1

## Redesign editorial - 23/06/2026

- Branch de trabalho: `feat/redesign-editorial-premium`, criada a partir da `main` sincronizada em `412c48a`.
- Direção: editorial técnico monocromático, com Barlow Condensed + Manrope, fundo papel, preto profundo e cinza mineral.
- Home reconstruída com hero de uma peça recortada, Seleção 01, bloco técnico, Kit Seleção, catálogo, manifesto e operação de entrega.
- Header recebeu navegação curta, contador de carrinho e menu mobile em `dialog` com Escape e foco inicial controlado.
- Produto, Kit, carrinho, checkout e páginas legais foram alinhados ao novo sistema sem mudar regras comerciais.
- Cutouts aprovados de preto e marrom foram vinculados às variações corretas; variantes brancas mantêm o original com `cutoutStatus: 'needs-review'`.
- Capturas antes/depois, auditoria, inventário e revisão estão em `docs/design-review/`, `docs/AUDITORIA_VISUAL.md`, `docs/ASSET_INVENTORY.md` e `docs/DIRECAO_VISUAL.md`.
- A CLI do Lighthouse não está disponível no ambiente. Não foi instalada como ferramenta global; build, lint, testes de domínio, E2E e revisão de viewport permanecem a evidência de qualidade executável.

## Hero 3D transparente - 24/06/2026

- Branch de trabalho: `feat/hero-video-3d`, criada a partir da `main` em `2df2fc0`.
- A hero passou a usar WebM VP9 com alfa, poster WebP RGBA e componente dedicado com fallback estático.
- Movimento reduzido e economia de dados não montam o vídeo; o poster permanece como experiência completa.
- O vídeo pausa fora da viewport e em aba oculta; não participa de foco, clique ou navegação.
- O topo da home usa fundo escuro, header claro e transição de volta ao papel após scroll; páginas internas preservam o comportamento anterior.
- Auditoria de mídia, riscos de compatibilidade e orientação de substituição: `docs/HERO_3D_VIDEO.md`.

## Auditoria de qualidade - 24/06/2026

- Branch de trabalho: `fix/quality-audit-hero-variants`, criada da `main` em `18566bb`.
- O frame fantasma foi atribuído à sobreposição permanente do poster atrás de um WebM com alfa, e não ao arquivo 3D. Poster e vídeo agora são mutuamente exclusivos nos estados visuais.
- Naquele PR, a hero passou a tocar apenas por hover fino em desktop, respeitar movimento reduzido/economia de dados/touch e remover as linhas cruzadas; o retorno ainda usava `requestAnimationFrame` e foi substituído pelo reverse dedicado no polimento seguinte.
- A resolução de mídia por cor foi centralizada para produto, miniaturas e carrinho; SKU pendente declara a variante sem simular imagem.
- Foram adicionados teste de mídia, auditoria do export, cenários Playwright de hover/rewind/variantes/kit/carrinho e capturas em `docs/quality-audit/`.
- Evidência atual: 7 viewports sem overflow e nenhuma ocorrência de console, página ou asset em `docs/quality-audit/after/runtime-issues.json`.

## Polimento da animação 3D - 24/06/2026

- Branch de trabalho: `fix/hero-animation-polish`, criada da `main` em `fba946a`.
- A causa do salto atual foi confirmada: o poster anterior correspondia ao frame 64, aproximadamente 2,100 s, enquanto o vídeo iniciava em 0,000 s.
- O poster foi regenerado do frame inicial real, em 0,000 s, com WebP ARGB 1920x1080.
- O retorno deixou de usar seek regressivo por `requestAnimationFrame`; foi adicionado `public/videos/useart-hero-transparente-reverse.webm`, VP9 transparente 1920x1080, 30 FPS, 8,366 s.
- A hero usa estados `idle`, `forward`, `holding-end`, `seeking-reverse`, `reverse` e `seeking-forward`, com token de transição para cancelar operações antigas.
- Forward toca uma vez, sem loop, segura o último frame no hover e retorna pelo reverse dedicado no mouseleave.
- Mobile, touch/coarse pointer, movimento reduzido e Save-Data continuam estáticos e não montam os vídeos.
- Evidências: `docs/hero-animation-polish/DIAGNOSIS.md`, `docs/hero-animation-polish/RESULT.md`, capturas after, gravação local e checks de viewport/runtime.

## Auditoria inicial

- Branch inicial: `main`.
- Último commit auditado: `498fff8 Corrige admin local e documenta MVP useART`.
- Remote: `origin https://github.com/TeoZ08/useART.git`.
- Estado do Git antes da execução: limpo.
- Stack anterior: React/Vite em JavaScript, CSS global e aplicação concentrada em `src/main.jsx` e `src/styles.css`.

## Preservado

- Assets válidos em `public/assets`.
- Assets antigos de produto foram mantidos no repositório para comparação e rollback, mas não são mais referenciados pelo catálogo tipado.
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
- Build configurado para exportação estática em `out`, compatível com Render Static Site.
- Compatibilidade temporária: `postbuild` replica `out` em `dist` para evitar falha no serviço Render existente enquanto o dashboard não for atualizado para `out`.

## Assets importados em 18/06/2026

Origem: `useART_ASSETS_SEGUROS_PARA_CODEX.zip`.

- `public/assets/products/hybrid-logo-lateral/branco.png` — Camiseta Híbrida com logo lateral, branco/off-white, imagem principal/galeria.
- `public/assets/products/hybrid-logo-lateral/preto.png` — Camiseta Híbrida com logo lateral, preto, galeria.
- `public/assets/products/hybrid-logo-lateral/marrom.png` — Camiseta Híbrida com logo lateral, marrom, galeria.
- `public/assets/products/hybrid-logo-central/branco.png` — Camiseta Híbrida com logo central, branco/off-white, imagem principal/galeria.
- `public/assets/products/hybrid-logo-central/preto.png` — Camiseta Híbrida com logo central, preto, galeria.
- `public/assets/products/hybrid-logo-central/marrom.png` — Camiseta Híbrida com logo central, marrom, galeria.
- `public/assets/products/hybrid-assinatura/branco.png` — Camiseta Híbrida com assinatura lateral, branco/off-white, imagem principal/galeria.
- `public/assets/products/hybrid-assinatura/preto.png` — Camiseta Híbrida com assinatura lateral, preto, galeria.
- `public/assets/products/hybrid-assinatura/marrom.png` — Camiseta Híbrida com assinatura lateral, marrom, galeria.
- `public/assets/products/solid-assinatura/branco.png` — Camiseta Solid Masculina com assinatura lateral, branco/off-white, imagem principal/galeria.
- `public/assets/products/solid-assinatura/preto.png` — Camiseta Solid Masculina com assinatura lateral, preto, galeria.
- `public/assets/products/solid-assinatura/marrom.png` — Camiseta Solid Masculina com assinatura lateral, marrom, galeria.
- `public/assets/products/solid-lisa/branco.png`, `preto.png`, `marrom.png` — peças lisas auditadas e importadas, mas não usadas no catálogo porque não correspondem à Solid com logo central.

## Placeholders mantidos

- Moletom ART: sem imagem no ZIP.
- Kit Seleção: pasta sem composição final no ZIP.
- Camiseta Solid Masculina com logo central: imagens lisas não foram usadas como se fossem logo central.

## Assets antigos removidos

- Nenhum asset antigo foi apagado nesta etapa.

## Bloqueios e limites

- Sem backend nesta fase.
- Sem Supabase, Mercado Pago, ORM, filas ou storage.
- Carrinho e cupom continuam transitórios no navegador.
- Validação definitiva de cupom, estoque, pedido e status depende de servidor.
- Imagens, textos jurídicos, composição, medidas e regras comerciais completas continuam pendentes.
