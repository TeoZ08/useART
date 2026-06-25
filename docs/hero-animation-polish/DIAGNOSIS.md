# Diagnóstico - polimento da animação 3D da hero

Data da reprodução: 24/06/2026. Branch base: `fix/hero-animation-polish`, criada da `main` em `fba946a`.

## Arquivos auditados

- `components/home/HeroShirtMedia.tsx`
- `components/home/HeroShirtMedia.module.css`
- `components/home/Hero.tsx`
- `components/home/Hero.module.css`
- `public/videos/useart-hero-transparente.webm`
- `public/images/useart-hero-poster.webp`

## Evidência de antes

Os artefatos de reprodução estão em `docs/hero-animation-polish/before/`:

- `current-hover-behavior.webm`: gravação do comportamento anterior.
- `idle-current.png`, `hover-350ms-current.png`, `rewind-current.png`, `returned-current.png`, `hover-after-9s-current.png`, `rapid-enter-exit-current.png`.
- `runtime-events-current.json`: eventos de mídia durante hover, mouseleave, hover prolongado e entradas/saídas rápidas.
- `frame-analysis/`: poster antigo, frame zero, frame em 2,1 s, último frame e diffs.

## Causa 1 - poster incompatível com frame zero

O poster anterior não correspondia ao início do vídeo. A varredura automática comparou o poster contra todos os frames do WebM a 30 FPS:

```text
best_frame=64 approx_time=2.100 psnr_avg=29.34
```

Comparações principais:

| Comparação                                     | PSNR médio | Interpretação                           |
| ---------------------------------------------- | ---------- | --------------------------------------- |
| Poster antigo x frame zero do forward          | 12,638 dB  | pose claramente incompatível            |
| Poster antigo x frame em aproximadamente 2,1 s | 29,336 dB  | melhor correspondência do poster antigo |

Como a implementação anterior resetava `currentTime = 0`, havia dois saltos inevitáveis:

- poster em aproximadamente 2,1 s para vídeo em 0 s ao iniciar;
- vídeo em 0 s para poster em aproximadamente 2,1 s ao terminar.

## Causa 2 - rewind por seeks sucessivos

O retorno anterior reduzia `video.currentTime` dentro de `requestAnimationFrame`, com escrita aproximadamente a cada 48 ms. O log de eventos do baseline registrou:

```json
{
  "seeking": 94,
  "seeked": 83,
  "play": 12,
  "playing": 13,
  "loopTrue": 67
}
```

Primeiros seeks durante um único rewind:

```text
1.691 -> 1.4646 -> 1.2584 -> 1.0732 -> 0.9065 -> 0.7586 -> 0.6274 -> 0.5121 -> 0.4121 -> 0.326 -> 0.2528 -> 0.1915
```

Isso confirma o risco técnico do prompt: o browser não reproduzia vídeo reverso; ele fazia uma sequência de seeks no decoder VP9. O efeito visual observado foi cadência irregular, pequenos congelamentos e saltos no fim do retorno.

## Causa 3 - loop abrupto

O componente anterior colocava `video.loop = true` durante hover. Ao permanecer sobre a camiseta por mais que a duração de 8,366 s, o arquivo reiniciava. Como o último frame e o primeiro frame não formam um loop perfeito, o retorno para o início era perceptível. A captura `hover-after-9s-current.png` registra o estado após ultrapassar a duração.

## Conclusão

O WebM original está correto. A falha estava na integração:

- poster escolhido no tempo errado;
- troca entre poster e vídeo em poses diferentes;
- simulação de reverse por seek contínuo;
- loop ativo em um vídeo que não foi produzido como loop.

A correção precisa alinhar o poster ao frame inicial real, remover loop, trocar o rewind manual por um WebM reverso dedicado e impedir operações concorrentes por token de transição.
