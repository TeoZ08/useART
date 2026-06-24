# Hero 3D com transparência

## Propósito e origem

A hero editorial usa uma camiseta 3D branca com logo preta como visual de marca em movimento. Ela não representa um SKU nem mostra preço: a posição da logo não foi vinculada comercialmente sem uma validação específica do catálogo.

O arquivo de origem fornecido foi `useart-hero-transparente.webm`, fora do repositório, em `../useART-camiseta-3D/Frames/`. Apenas o artefato final aprovado e seu poster derivado entram no Git.

## Auditoria do WebM

Comando executado:

```bash
ffprobe -v error -show_format -show_streams -of json useart-hero-transparente.webm
```

| Propriedade | Resultado confirmado                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Container   | WebM / Matroska                                                                                                         |
| Codec       | VP9 (Profile 0)                                                                                                         |
| Resolução   | 1920 x 1080                                                                                                             |
| FPS         | 30                                                                                                                      |
| Duração     | 8,366 s                                                                                                                 |
| Tamanho     | 1.419.977 bytes (aprox. 1,42 MB)                                                                                        |
| Áudio       | Nenhum stream de áudio                                                                                                  |
| Alfa        | Tag `alpha_mode=1`; o decoder `libvpx-vp9` expôs `yuva420p` e a análise de alfa confirmou pixels transparentes e opacos |

O `ffprobe` padrão informa `yuv420p`; isso não invalida o alfa. A verificação foi repetida com `ffmpeg -c:v libvpx-vp9`, que decodifica o stream como `yuva420p`.

## Arquivos versionados

| Arquivo                                       | Papel                                | Dados                                         |
| --------------------------------------------- | ------------------------------------ | --------------------------------------------- |
| `public/videos/useart-hero-transparente.webm` | Animação principal                   | VP9 transparente, 1920 x 1080, aprox. 1,42 MB |
| `public/images/useart-hero-poster.webp`       | Fallback estático e primeira pintura | WebP RGBA, 1600 x 900, 32 KB                  |

O poster foi derivado do tempo aproximado de **2,1 s**, após revisão de uma folha de contato com frames em 0,5 s, 2,1 s, 3,8 s, 5,4 s e 7,1 s. Ele foi escolhido por mostrar a frente em três quartos, logo legível, mangas, gola e barra inteiras. A transparência e a ausência de halo foram revisadas em fundo `ink` e `paper`.

Não entram no Git: `Animated Walking Tshirt.blend`, `animationcache.abc`, `Fabric_NormalGL.png`, `Example_corrigido_gola_branca.png`, a sequência `useart-hero-final*.png`, qualquer cache ou frame intermediário. O `.gitignore` bloqueia `*.blend`, `*.abc` e `useart-hero-final*.png` sem ignorar imagens válidas do site.

## Integração

`components/home/HeroShirtMedia.tsx` é um Client Component com estas garantias:

- renderiza o poster imediatamente, inclusive no HTML sem JavaScript;
- monta o `<video>` somente depois de avaliar as preferências no cliente;
- usa estados explícitos `fallback`, `loading`, `ready`, `playing`, `rewinding` e `error`;
- mantém poster e vídeo mutuamente exclusivos: quando o vídeo mostra frames, o poster fica totalmente oculto, sem crossfade entre camisetas em posições diferentes;
- preserva o poster em qualquer erro de mídia;
- usa `muted`, `loop`, `playsInline`, `preload="metadata"`, sem controles, Picture-in-Picture, Remote Playback, foco ou captura de clique;
- não adiciona preload manual do vídeo no documento e não usa biblioteca de animação.

O container tem tamanho estável, `pointer-events: none`, fundo transparente, sem borda, card ou sombra. O vídeo usa `object-fit: contain`; nenhuma parte essencial é recortada.

## Movimento, dados e pausa

- Em desktop com `(hover: hover) and (pointer: fine)`, o poster é o estado inicial. A animação começa apenas ao entrar na área real da camiseta; não existe autoplay.
- A saída do ponteiro pausa a frente e reduz `currentTime` em `requestAnimationFrame` até zero, com easing e duração limitada de 900 ms a 1800 ms. Reentrada cancela o rewind ativo.
- `prefers-reduced-motion: reduce`, touch/coarse pointer e `navigator.connection?.saveData === true`: o vídeo não é montado; somente o poster é usado. Há também uma regra CSS defensiva.
- `IntersectionObserver` e `visibilitychange`: ao deixar viewport ou tornar a aba invisível, o vídeo é parado e volta ao estado `ready`; ele não retoma sozinho.
- Uma rejeição de `play()` por cancelamento rápido de hover não é tratada como erro. Um erro real de mídia mantém o poster e entra no estado `error`.

## Composição e header

A hero ficou em `ink` profundo, com luz radial mineral discreta atrás da peça e sem linhas atravessando a composição. O título, indexação, CTA `Explorar coleção` e link `Falar com a ART` permanecem; dados de SKU/preço foram removidos da hero. O header fica claro no topo escuro e recupera fundo papel/texto escuro ao rolar. Páginas internas mantêm o header escuro existente.

## Compatibilidade e limites

Chrome/Chromium desktop e Chromium mobile foram verificados localmente. O ambiente não possui Firefox nem Safari/iOS para teste direto. WebM VP9 com alfa pode ter suporte irregular em navegadores Apple; nesses casos, o poster transparente continua disponível e nenhum conteúdo essencial depende do vídeo. Não foi criado MP4, porque H.264 não preserva a transparência deste asset.

Lighthouse continua indisponível no ambiente e não foi instalado globalmente. A validação usa build, E2E, inspeção de requests/atributos e capturas em viewport. Para substituir a animação no futuro, mantenha o mesmo caminho, reexecute `ffprobe`, preserve alfa com `libvpx-vp9`, gere um poster RGBA revisado e atualize esta auditoria.

## Evidências visuais

As capturas originais do export estático estão em `docs/design-review/hero-video/`. A revisão corretiva de 24/06/2026 está em `docs/quality-audit/after/`:

- `hero-desktop-initial.png`: poster parado sem autoplay;
- `hero-desktop-hover.png`: frame do vídeo sem poster visível atrás;
- `hero-desktop-rewind.png` e `hero-desktop-return.png`: retorno suave e estado final de poster;
- `hero-mobile-poster.png`: composição touch com poster apenas;
- `header-after-scroll.png`: contraste do header após sair da hero;
- `viewport-checks.json`: sete viewports sem overflow horizontal.
