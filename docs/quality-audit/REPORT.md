# Auditoria de qualidade - Hero e variantes

Data da revisão: 24/06/2026.

## Escopo e evidências anteriores

Esta auditoria não altera catálogo, preços, regras comerciais ou a direção editorial aprovada. A referência visual continua sendo [useART - Direção visual premium e referências](https://app.notion.com/p/3889e482afb58107b00cebb06d729915).

As evidências da versão publicada antes da correção estão em `docs/quality-audit/before/`:

- `home-desktop-live.png` e `home-mobile-live.png`: captura de produção antes da correção;
- `hero-later-frame-ghost.png`: reprodução em aproximadamente 5,4 s, com a camiseta animada lateral e o poster frontal visível atrás;
- `variant-matrix-published.json`: matriz de swatches e URLs obtida na produção antes da alteração.

O defeito do hero foi reproduzido e confirmado. O WebM continha alfa e a camiseta 3D correta; o problema era a composição do frontend. O poster permanecia visível sob o vídeo transparente depois que seus frames divergiam. As áreas alfa revelavam a camiseta congelada do poster, produzindo o frame fantasma. A mesma revisão confirmou que `gridLineOne` e `gridLineTwo` cruzavam toda a hero.

## Correções aplicadas

### Hero

`HeroShirtMedia` agora usa uma máquina de estados explícita: `fallback`, `loading`, `ready`, `playing`, `rewinding` e `error`.

- Poster e vídeo são mutuamente exclusivos na pintura: durante `playing` e `rewinding`, o poster usa `visibility: hidden`; no restante, o vídeo permanece oculto.
- Não há autoplay. O vídeo só é montado e habilitado em desktop com `(hover: hover) and (pointer: fine)`, sem `prefers-reduced-motion` e sem `Save-Data`.
- A área de hover acompanha a região efetiva da peça, não a hero inteira. Links e CTA continuam interativos.
- Ao sair do hover, o vídeo pausa e volta ao tempo zero por `requestAnimationFrame`, com easing e duração limitada entre 900 ms e 1800 ms. Reentrar cancela o rewind sem concorrência.
- Rejeições de `play()` causadas por uma saída rápida do ponteiro não são classificadas como erro de mídia. Um erro real preserva o poster.
- Saída da viewport ou aba oculta interrompe a reprodução e restaura o estado `ready`, evitando atividade invisível.
- `gridLineOne`, `gridLineTwo` e o CSS correspondente foram removidos.

### Variantes, galeria e carrinho

`domain/products/media.ts` centraliza a resolução de mídia por produto e cor. Cada mídia declarada no catálogo recebe `colorId`; a cor selecionada passa a ser a fonte de verdade da imagem principal.

- Swatch: atualiza a cor e retorna à mídia correta.
- Miniatura: atualiza a cor quando a miniatura representa uma variação, evitando galeria e swatch divergentes.
- Carrinho: usa a mesma resolução de mídia da página de produto.
- SKU sem imagem por cor: recebe alt e mensagem explícita com a cor selecionada, sem reutilizar visualmente outra variante.
- Kit: cada preview contém aplicação, cor e `colorId` próprios.
- O carrinho filtra estruturas inválidas de `localStorage`, em vez de renderizar dados corrompidos.

## Cobertura do catálogo

| Oferta                               | Branco/off-white                  | Preto           | Marrom          | Resultado da auditoria      |
| ------------------------------------ | --------------------------------- | --------------- | --------------- | --------------------------- |
| Moletom ART                          | pendente                          | -               | -               | placeholder honesto         |
| Híbrida - logo lateral               | original, `needs-review`          | cutout          | cutout          | mídia por cor validada      |
| Híbrida - logo central               | original, `needs-review`          | cutout          | cutout          | mídia por cor validada      |
| Híbrida - assinatura lateral         | original, `needs-review`          | cutout          | cutout          | mídia por cor validada      |
| Kit Seleção                          | original por peça, `needs-review` | cutout por peça | cutout por peça | três escolhas independentes |
| Solid Masculina - logo central       | pendente                          | pendente        | pendente        | nenhuma imagem simulada     |
| Solid Masculina - assinatura lateral | original, `needs-review`          | cutout          | cutout          | mídia por cor validada      |

O teste de domínio verifica as sete ofertas, existência dos arquivos, associação `colorId`, unicidade dos hashes das imagens disponíveis por SKU, presença na galeria e cópia dos assets para `out/` após o build.

## Capturas posteriores

As capturas estão em `docs/quality-audit/after/`:

- `hero-desktop-initial.png`, `hero-desktop-hover.png`, `hero-desktop-rewind.png` e `hero-desktop-return.png`;
- `hero-mobile-poster.png` e `header-after-scroll.png`;
- `product-lateral-white.png`, `product-lateral-black.png` e `product-lateral-brown.png`;
- `product-pending-solid-brown.png`;
- `kit-three-configurations.png`, `cart-brown-variant.png` e `checkout.png`;
- `viewport-checks.json`: sete viewports, todos sem overflow horizontal;
- `runtime-issues.json`: sem erros de console, página ou assets durante a captura.

## Validação executada

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run test:e2e
npm run build
npm run audit:media
npm run capture:quality
```

Resultados locais: lint e TypeScript sem erros; 21 testes de domínio passaram (um caso pós-build é pulado fora do comando de auditoria); 17 testes Playwright passaram; build estático concluiu; a auditoria pós-build executou 4 testes e passou.

## Limitações reais

- O WebM VP9 com alfa continua dependente de suporte do navegador. Poster estático é a experiência completa quando o vídeo não é compatível, quando há movimento reduzido, economia de dados, touch/coarse pointer ou erro.
- Não foram testados Firefox, Safari/iOS ou Lighthouse neste ambiente.
- Não há foto oficial do Moletom, composição final do Kit ou imagem da Solid logo central. Esses SKUs continuam deliberadamente pendentes.
- Carrinho e cupom permanecem no navegador; regras comerciais definitivas exigem backend.
