# Inventário de assets e cutouts

Data da revisão: 23/06/2026. Os originais permanecem em `public/assets/products/`. Derivados transparentes aprovados ficam em `public/assets/products/cutouts/` e nunca substituem os originais.

## Método

`scripts/assets/create-cutouts.mjs` usa o navegador local para estimar o fundo de estúdio a partir das bordas, remover apenas o fundo conectado às extremidades e manter o maior componente central. O resultado foi revisado sobre fundo escuro.

O script não tenta forçar recorte em peças brancas/off-white. Nesses arquivos, tecido claro e fundo neutro são próximos demais para garantir bordas, costuras e logos sem um recorte manual. Eles ficam com `cutoutStatus: 'needs-review'` e não são usados como cutout no layout.

## Hero editorial 3D

| Arquivo                                | Uso                        | Formato / resolução         | Tamanho | Status    | Observação                                                                         |
| -------------------------------------- | -------------------------- | --------------------------- | ------- | --------- | ---------------------------------------------------------------------------------- |
| `videos/useart-hero-transparente.webm` | Animação principal da hero | VP9 WebM, 1920x1080, 30 FPS | 1,42 MB | available | Alfa confirmado por `alpha_mode=1` e decoder `libvpx-vp9`; não é um SKU comercial. |
| `images/useart-hero-poster.webp`       | Poster e fallback da hero  | WebP RGBA, 1600x900         | 32 KB   | available | Frame de aprox. 2,1 s, revisado em fundo escuro e claro.                           |

Os fontes de produção 3D, caches e frames de decisão não fazem parte de `public/` nem do Git. A auditoria detalhada está em `docs/HERO_3D_VIDEO.md`.

## Assets oficiais aplicáveis ao catálogo

| Original                         | Produto / aplicação                 | Cor              | Resolução original | Derivado                                   | Status       | Observação                                               |
| -------------------------------- | ----------------------------------- | ---------------- | ------------------ | ------------------------------------------ | ------------ | -------------------------------------------------------- |
| `hybrid-logo-lateral/preto.png`  | Híbrida, logo lateral               | Preto            | 3500x3500          | `hybrid-logo-lateral-preto.png` 2048x2048  | available    | Cutout aprovado e usado.                                 |
| `hybrid-logo-lateral/marrom.png` | Híbrida, logo lateral               | Marrom           | 3500x3500          | `hybrid-logo-lateral-marrom.png` 2048x2048 | available    | Cutout aprovado e usado.                                 |
| `hybrid-logo-lateral/branco.png` | Híbrida, logo lateral               | Branco/off-white | 3500x3500          | -                                          | needs-review | Mantido original; recorte automático erode tecido claro. |
| `hybrid-logo-central/preto.png`  | Híbrida, logo central               | Preto            | 3500x3500          | `hybrid-logo-central-preto.png` 2048x2048  | available    | Cutout aprovado e usado.                                 |
| `hybrid-logo-central/marrom.png` | Híbrida, logo central               | Marrom           | 3500x3500          | `hybrid-logo-central-marrom.png` 2048x2048 | available    | Cutout aprovado e usado.                                 |
| `hybrid-logo-central/branco.png` | Híbrida, logo central               | Branco/off-white | 3500x3500          | -                                          | needs-review | Mantido original; revisão manual necessária.             |
| `hybrid-assinatura/preto.png`    | Híbrida, assinatura lateral         | Preto            | 3500x3500          | `hybrid-assinatura-preto.png` 2048x2048    | available    | Cutout aprovado e usado.                                 |
| `hybrid-assinatura/marrom.png`   | Híbrida, assinatura lateral         | Marrom           | 3500x3500          | `hybrid-assinatura-marrom.png` 2048x2048   | available    | Cutout aprovado e usado.                                 |
| `hybrid-assinatura/branco.png`   | Híbrida, assinatura lateral         | Branco/off-white | 3500x3500          | -                                          | needs-review | Mantido original; revisão manual necessária.             |
| `solid-assinatura/preto.png`     | Solid Masculina, assinatura lateral | Preto            | 7387x8192          | `solid-assinatura-preto.png` 2048x2271     | available    | Cutout aprovado e usado.                                 |
| `solid-assinatura/marrom.png`    | Solid Masculina, assinatura lateral | Marrom           | 6973x8192          | `solid-assinatura-marrom.png` 2048x2406    | available    | Cutout aprovado e usado.                                 |
| `solid-assinatura/branco.png`    | Solid Masculina, assinatura lateral | Branco/off-white | 6973x8192          | -                                          | needs-review | Mantido original; revisão manual necessária.             |

## Assets preservados, sem mapeamento comercial atual

| Original                                                                                                                   | Uso possível                   | Cor              | Resolução original | Derivado                                             | Status       | Observação                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------- | ------------------ | ---------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `solid-lisa/preto.png`                                                                                                     | Referência Solid lisa          | Preto            | 7387x8192          | `solid-lisa-preto.png` 2048x2271                     | available    | Não usado como Solid logo central.                                                                                |
| `solid-lisa/marrom.png`                                                                                                    | Referência Solid lisa          | Marrom           | 6973x8192          | `solid-lisa-marrom.png` 2048x2406                    | available    | Não usado como Solid logo central.                                                                                |
| `solid-lisa/branco.png`                                                                                                    | Referência Solid lisa          | Branco/off-white | 6973x8192          | -                                                    | needs-review | Não corresponde ao SKU e exige recorte manual.                                                                    |
| `camiseta-preta-costas.jpg`                                                                                                | Mockup legado, costas          | Preto            | 1600x1600          | `camiseta-preta-costas.png` 1600x1600                | available    | Derivado já presente, preservado.                                                                                 |
| `camiseta-marrom-costas.jpg`                                                                                               | Mockup legado, costas          | Marrom           | 1600x1600          | `camiseta-marrom-costas.png` 1600x1600               | available    | Derivado já presente, preservado.                                                                                 |
| `hybrid-art-preta.jpg`, `hybrid-art-preta-alt.jpg`                                                                         | Mockup legado Híbrida          | Preto            | 1600x1600          | `hybrid-art-preta.png`, `hybrid-art-preta-alt.png`   | available    | Derivados já presentes; não substituem SKU oficial.                                                               |
| `hybrid-art-marrom.jpg`, `hybrid-art-marrom-alt.jpg`                                                                       | Mockup legado Híbrida          | Marrom           | 1600x1600          | `hybrid-art-marrom.png`, `hybrid-art-marrom-alt.png` | available    | Derivados já presentes; não substituem SKU oficial.                                                               |
| `solid-assinatura-masculina-preta.jpg`, `solid-assinatura-marrom.jpg`                                                      | Mockup legado Solid assinatura | Preto / marrom   | 1600x1600          | `solid-assinatura-masculina-preta.png`               | available    | Originais preservados; o nome `solid-assinatura-marrom.png` foi reservado ao cutout oficial aplicado no catálogo. |
| `camiseta-branca-costas.jpg`, `hybrid-art-branca.jpg`, `hybrid-central-branca.jpg`, `solid-assinatura-feminina-branca.jpg` | Mockups legados claros         | Branco/off-white | 1600x1600          | -                                                    | needs-review | Recorte automático não aprovado por halos e erosão.                                                               |

## Pendências de imagem

- Logo final corrigida.
- Foto real do Moletom ART.
- Composição final do Kit Seleção.
- Foto da Solid Masculina com logo central.
- Fotografias reais com pessoas.
- Recorte manual de todas as peças brancas/off-white antes de uso em hero ou galeria sobre fundo escuro.
