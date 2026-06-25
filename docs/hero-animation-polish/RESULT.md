# Resultado - polimento definitivo da animação 3D

Data da implementação: 24/06/2026. Branch: `fix/hero-animation-polish`.

## O que mudou

- O poster da hero foi regenerado a partir do frame inicial real do WebM, em `0,000 s`.
- A animação forward preserva o WebM original em `public/videos/useart-hero-transparente.webm`.
- Foi adicionado o reverse dedicado `public/videos/useart-hero-transparente-reverse.webm`.
- O componente passou a usar dois vídeos sincronizados, sem `loop` e sem seek regressivo contínuo.
- O estado inicial desktop mostra o próprio forward pausado no frame zero; o poster fica reservado para carregamento, fallback, touch, reduced motion e Save-Data.
- Reentrada durante reverse usa espelhamento de tempo (`duration - currentTime`) e troca a mídia visível apenas depois de `seeked`.
- Um token de transição invalida callbacks antigos para evitar plays, seeks e trocas obsoletas.

## Comandos FFmpeg e assets

Poster novo:

```bash
ffmpeg -hide_banner -loglevel error -y \
  -c:v libvpx-vp9 \
  -i public/videos/useart-hero-transparente.webm \
  -frames:v 1 \
  docs/hero-animation-polish/before/frame-analysis/forward-frame-0.png

cwebp -quiet -lossless -z 8 -alpha_q 100 \
  docs/hero-animation-polish/before/frame-analysis/forward-frame-0.png \
  -o public/images/useart-hero-poster.webp
```

Reverse:

```bash
ffmpeg -hide_banner -loglevel error -y \
  -c:v libvpx-vp9 \
  -i public/videos/useart-hero-transparente.webm \
  -vf reverse \
  -an \
  -c:v libvpx-vp9 \
  -pix_fmt yuva420p \
  -auto-alt-ref 0 \
  -b:v 0 \
  -crf 30 \
  -g 15 \
  public/videos/useart-hero-transparente-reverse.webm
```

| Asset                                                 | Dados confirmados                                             | Tamanho |
| ----------------------------------------------------- | ------------------------------------------------------------- | ------- |
| `public/videos/useart-hero-transparente.webm`         | VP9, 1920x1080, 30 FPS, 8,366 s, `alpha_mode=1`, sem áudio    | 1,42 MB |
| `public/videos/useart-hero-transparente-reverse.webm` | VP9, 1920x1080, 30 FPS, 8,366 s, `ALPHA_MODE=1`, sem áudio    | 1,77 MB |
| `public/images/useart-hero-poster.webp`               | WebP `argb`, 1920x1080, lossless, derivado do frame `0,000 s` | 155 KB  |

O poster novo composto sobre o fundo real da hero (`#090909`) teve PSNR infinito contra o frame zero extraído, ou seja, é visualmente idêntico nessa composição. A diferença bruta em RGBA é irrelevante para pixels totalmente transparentes.

## Comparação forward/reverse

Frames espelhados foram comparados em `docs/hero-animation-polish/asset-validation/`:

| Ponto | Comparação                | PSNR médio |
| ----- | ------------------------- | ---------- |
| 0%    | forward 0% x reverse 100% | 52,24 dB   |
| 25%   | forward 25% x reverse 75% | 24,93 dB   |
| 50%   | forward 50% x reverse 50% | 25,83 dB   |
| 75%   | forward 75% x reverse 25% | 25,30 dB   |
| 100%  | forward 100% x reverse 0% | 56,75 dB   |

Os extremos são praticamente equivalentes. Nos pontos intermediários existe diferença de reencode VP9, mas a gravação final em velocidade normal não mostra troca de pose, flash ou duplicidade.

## Máquina de estados

Estados usados:

```text
fallback
loading
idle
seeking-forward
forward
holding-end
seeking-reverse
reverse
error
```

Visibilidade separada:

```text
poster | forward | reverse
```

Regras principais:

- `idle`: forward pausado no frame inicial e visível.
- Hover em `idle`: forward toca uma vez, com `loop=false`.
- Fim do forward: estado `holding-end`; último frame permanece visível enquanto o mouse continua sobre a peça.
- Mouseleave durante forward: forward pausa, reverse busca `duration - forward.currentTime`, só troca a mídia visível após `seeked` e reproduz até o frame inicial.
- Mouseleave em `holding-end`: reverse começa do início.
- Reentrada durante reverse: reverse pausa, forward busca `duration - reverse.currentTime`, só troca após `seeked` e continua forward.
- Se uma intenção nova chega, o token de transição invalida listeners e promises antigos.

## Fallbacks

- Touch/coarse pointer: vídeos não são montados.
- `prefers-reduced-motion: reduce`: vídeos não são montados.
- `navigator.connection.saveData === true`: vídeos não são montados.
- Erro no forward: poster estático e estado `error`.
- Erro no reverse: não existe rewind por seek contínuo; a UI cai para o frame inicial estático/idle com uma troca curta e preserva o resto da home.

## Evidências after

Capturas em `docs/hero-animation-polish/after/`:

- `hero-idle.png`
- `hero-forward-start.png`
- `hero-forward-mid.png`
- `hero-forward-last.png`
- `hero-reverse-start.png`
- `hero-reverse-mid.png`
- `hero-reverse-end.png`
- `hero-reentry-during-reverse.png`
- `hero-mobile-static.png`
- `hero-reduced-motion-static.png`
- `final-local-behavior.webm`
- `final-local-contact-sheet.jpg`
- `runtime-issues.json`
- `viewport-checks.json`

Resultado local:

- `runtime-issues.json`: `[]`
- sete viewports sem overflow horizontal;
- gravação local em velocidade normal com 22,4 s;
- revisão visual por contact sheet sem camiseta duplicada, flash, mudança de escala ou loop.

## Testes adicionados

- `tests/domain/hero-animation-machine.test.ts`
- `tests/e2e/hero-animation-polish.spec.ts`
- `tests/domain/assets.test.ts` passou a cobrir poster, forward e reverse da hero.
- `tests/e2e/main-flow.spec.ts` foi atualizado para o contrato forward/reverse.

## Limitações

- O fallback Apple/Safari continua sendo o poster, porque MP4/H.264 não preserva alpha.
- O reverse adiciona aproximadamente 1,77 MB apenas no desktop com hover fino; mobile, reduced motion e Save-Data não montam os vídeos.
- O WebM original foi preservado; nenhum `.blend`, `.abc` ou sequência PNG foi adicionada.
