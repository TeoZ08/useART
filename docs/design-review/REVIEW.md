# Revisão visual - Redesign editorial ART

Data: 23/06/2026. Base comparada: capturas de `before/` contra a branch `feat/redesign-editorial-premium`.

## Capturas

### Antes

- `before/home-desktop.png`
- `before/home-mobile.png`

### Depois

- `after/home-desktop-full.png`
- `after/home-desktop-fold.png`
- `after/home-mobile-full.png`
- `after/product-desktop.png`
- `after/product-mobile.png`
- `after/kit-desktop.png`
- `after/cart-desktop.png`
- `after/checkout-desktop.png`
- `after/viewport-checks.json`

As capturas são geradas por `node scripts/design/capture-review.mjs`, com carregamento de imagens lazy e verificação de largura do documento.

## Comparação objetiva

| Critério            | Antes                                                     | Depois                                                                                                   |
| ------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Hero                | Três mockups sobre painéis e três CTAs concorrentes.      | Uma peça recortada preta em fundo off-white, título editorial, uma CTA e link secundário.                |
| Navegação           | Barra tripla de promoções e botão duplicado de compra.    | Navegação curta, contador do carrinho, menu mobile em `dialog` e faixa única de informação.              |
| Tipografia          | Arial com uso frequente de 900/950.                       | Barlow Condensed e Manrope por `next/font`, com hierarquia por escala e peso moderado.                   |
| Home                | Catálogo imediato e repetitivo.                           | Campanha, seleção assimétrica, produto/função, Kit, manifesto, compra assistida e catálogo.              |
| Produto             | Galeria e compra funcionais, mas com composição uniforme. | Galeria editorial ampliável, compra clara, informações de confirmação/pendência e produtos relacionados. |
| Kit                 | Campos corretos, porém sem resumo visual.                 | Três peças numeradas, miniatura derivada da configuração e controles sem compressão.                     |
| Carrinho e checkout | Estrutura em painéis genéricos.                           | Resumo financeiro aberto, itens e formulários com hierarquia editorial e leitura mobile preservada.      |

## Perguntas de aceite

- **O hero ainda parece template?** Não. A composição usa uma única peça recortada, dados de coleção e tipografia como estrutura, sem painel branco ou bloco de CTA concorrente.
- **Existe retângulo de fundo não intencional nas imagens?** Não no hero, seleção editorial, Kit configurado ou cards com cutout. Placeholders e fotografias sem recorte permanecem explicitamente identificados e intencionais.
- **A hierarquia é clara em cinco segundos?** Sim: marca/navegação, slogan, produto e `Explorar coleção` aparecem na primeira dobra.
- **Existe apenas uma CTA principal por bloco?** Sim. Links secundários são textuais e não competem com a ação principal.
- **O mobile tem direção própria?** Sim. Hero, seleção, Kit, header e controles possuem breakpoints próprios; não há empilhamento automático sem hierarquia.
- **Preço e compra estão fáceis de encontrar?** Sim. Produto, carrinho e checkout deixam preço, variações, quantidade, resumo e ação principal próximos.
- **Existe animação prejudicial?** Não. Apenas a entrada curta da peça no hero; `prefers-reduced-motion` a remove.
- **Houve regressão de performance?** Não foi observada no build ou nos fluxos. Imagens abaixo da dobra continuam lazy, hero tem dimensão conhecida e não foi adicionada biblioteca de animação. Lighthouse não foi executado: a CLI e navegador de sistema não estão disponíveis e a política do ambiente impede instalar ferramenta global sem solicitação específica.

## Responsividade

`after/viewport-checks.json` confirma `horizontalOverflow: false` em `1440x900`, `1280x800`, `1024x768`, `768x1024`, `430x932`, `390x844` e `360x800`.

## Pendências visuais

- Recorte manual das peças brancas/off-white antes de exibi-las sobre fundo escuro.
- Logo final corrigida.
- Fotos reais com pessoas, Moletom ART, composição do Kit e Solid logo central.
- Dados finais de medidas, composição, cuidados e políticas.
