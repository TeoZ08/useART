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
- mantém o poster atrás do vídeo até `canplay`, com transição curta de opacidade;
- preserva o poster em qualquer erro de mídia;
- usa `muted`, `loop`, `playsInline`, `preload="metadata"`, sem controles, Picture-in-Picture, Remote Playback, foco ou captura de clique;
- não adiciona preload manual do vídeo no documento e não usa biblioteca de animação.

O container tem tamanho estável, `pointer-events: none`, fundo transparente, sem borda, card ou sombra. O vídeo usa `object-fit: contain`; nenhuma parte essencial é recortada.

## Movimento, dados e pausa

- `prefers-reduced-motion: reduce`: o vídeo não é montado/inicializado; somente o poster é usado. Há também uma regra CSS defensiva.
- `navigator.connection?.saveData === true`: o vídeo não é montado; o poster permanece como experiência completa.
- `IntersectionObserver`: pausa quando a hero deixa a viewport e retoma quando retorna.
- `visibilitychange`: pausa quando a aba fica oculta e tenta retomar apenas quando a aba volta a ficar visível.

## Composição e header

A hero ficou em `ink` profundo, com grade editorial de baixo contraste e luz radial mineral discreta atrás da peça. O título, indexação, CTA `Explorar coleção` e link `Falar com a ART` permanecem; dados de SKU/preço foram removidos da hero. O header fica claro no topo escuro e recupera fundo papel/texto escuro ao rolar. Páginas internas mantêm o header escuro existente.

## Compatibilidade e limites

Chrome/Chromium desktop e Chromium mobile foram verificados localmente. O ambiente não possui Firefox nem Safari/iOS para teste direto. WebM VP9 com alfa pode ter suporte irregular em navegadores Apple; nesses casos, o poster transparente continua disponível e nenhum conteúdo essencial depende do vídeo. Não foi criado MP4, porque H.264 não preserva a transparência deste asset.

Lighthouse continua indisponível no ambiente e não foi instalado globalmente. A validação usa build, E2E, inspeção de requests/atributos e capturas em viewport. Para substituir a animação no futuro, mantenha o mesmo caminho, reexecute `ffprobe`, preserve alfa com `libvpx-vp9`, gere um poster RGBA revisado e atualize esta auditoria.

## Evidências visuais

As capturas produzidas do export estático estão em `docs/design-review/hero-video/`:

- `desktop-initial.png`: frame inicial de frente;
- `desktop-later-frame.png`: rotação lateral/posterior pausada em aproximadamente 5,4 s;
- `mobile.png`: composição própria em 390 x 844;
- `reduced-motion-poster.png`: poster sem vídeo;
- `header-scrolled.png`: contraste do header após sair da hero;
- `viewport-checks.json`: sete viewports sem overflow horizontal.
