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

| Arquivo                                               | Papel                                | Dados                                         |
| ----------------------------------------------------- | ------------------------------------ | --------------------------------------------- |
| `public/videos/useart-hero-transparente.webm`         | Animação forward                     | VP9 transparente, 1920 x 1080, aprox. 1,42 MB |
| `public/videos/useart-hero-transparente-reverse.webm` | Animação reverse dedicada            | VP9 transparente, 1920 x 1080, aprox. 1,77 MB |
| `public/images/useart-hero-poster.webp`               | Fallback estático e primeira pintura | WebP ARGB, 1920 x 1080, aprox. 155 KB         |

O poster atual foi derivado do frame inicial real, em **0,000 s**. A revisão anterior confirmou que o poster antigo vinha do frame 64, aproximadamente **2,100 s**, e por isso saltava ao trocar para o vídeo em `currentTime = 0`. O novo poster composto sobre o fundo `ink` da hero é visualmente idêntico ao frame zero do WebM.

Não entram no Git: `Animated Walking Tshirt.blend`, `animationcache.abc`, `Fabric_NormalGL.png`, `Example_corrigido_gola_branca.png`, a sequência `useart-hero-final*.png`, qualquer cache ou frame intermediário. O `.gitignore` bloqueia `*.blend`, `*.abc` e `useart-hero-final*.png` sem ignorar imagens válidas do site.

## Integração

`components/home/HeroShirtMedia.tsx` é um Client Component com estas garantias:

- renderiza o poster imediatamente, inclusive no HTML sem JavaScript;
- monta os vídeos somente depois de avaliar as preferências no cliente;
- usa estados explícitos `fallback`, `loading`, `idle`, `seeking-forward`, `forward`, `holding-end`, `seeking-reverse`, `reverse` e `error`;
- separa estado de mídia visível (`poster`, `forward`, `reverse`) para garantir que apenas uma camada apareça por vez;
- preserva o poster em HTML sem JavaScript e em qualquer fallback estático;
- usa `muted`, `playsInline`, `preload`, sem controles, Picture-in-Picture, Remote Playback, foco ou captura de clique;
- não adiciona preload manual do vídeo no documento e não usa biblioteca de animação.

O container tem tamanho estável, `pointer-events: none`, fundo transparente, sem borda, card ou sombra. O vídeo usa `object-fit: contain`; nenhuma parte essencial é recortada.

## Movimento, dados e pausa

- Em desktop com `(hover: hover) and (pointer: fine)`, o estado inicial após carregamento é o próprio forward pausado no frame zero. O poster fica reservado para carregamento e fallback.
- A animação começa apenas ao entrar na área real da camiseta; não existe autoplay.
- O forward toca uma vez, com `loop=false`, e permanece no último frame enquanto o ponteiro continuar sobre a peça.
- A saída do ponteiro usa o WebM reverso dedicado. O componente calcula `reverseTime = duration - forward.currentTime`, prepara o reverse oculto, aguarda `seeked` e só então troca a mídia visível.
- Reentrada durante reverse calcula `forwardTime = duration - reverse.currentTime` e segue a mesma regra de preparar oculto antes de trocar.
- Não há seek regressivo contínuo por `requestAnimationFrame`.
- `prefers-reduced-motion: reduce`, touch/coarse pointer e `navigator.connection?.saveData === true`: o vídeo não é montado; somente o poster é usado. Há também uma regra CSS defensiva.
- `IntersectionObserver` e `visibilitychange`: ao deixar viewport ou tornar a aba invisível, os vídeos são parados e voltam ao estado `idle`; eles não retomam sozinhos.
- Uma rejeição de `play()` por cancelamento rápido de hover não é tratada como erro. Um erro real no forward mantém o poster e entra no estado `error`. Erro no reverse aciona fallback limpo para o frame inicial sem voltar ao seek contínuo.

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

O polimento definitivo da animação está em `docs/hero-animation-polish/`:

- `DIAGNOSIS.md`: confirmação do poster antigo em 2,100 s, loop e 94 eventos `seeking` no baseline;
- `RESULT.md`: comandos FFmpeg, dados do reverse, máquina de estados e limitações;
- `after/final-local-behavior.webm`: gravação local em velocidade normal;
- `after/final-local-contact-sheet.jpg`: revisão visual da gravação;
- `after/runtime-issues.json`: nenhum erro de runtime;
- `after/viewport-checks.json`: sete viewports sem overflow horizontal.
