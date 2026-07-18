# Launch polish V2

## Resolvido

| Problema                             | Decisão                                                                                                        | Arquivos                                                                        | Evidência                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Texto provisório em páginas públicas | Removida linguagem de operação, revisão e ambiente interno; detalhes faltantes foram registrados internamente. | `app/{entrega,trocas,privacidade,termos}/page.tsx`, `LegalPage.tsx`             | Rotas legais exibem somente informações confirmadas.         |
| Mídia do Moletom ART ausente         | Importados derivados WebP 4:5 dos três assets oficiais e associados às cores branca, preta e creme.            | `public/assets/products/moletom/`, `catalog.seed.ts`                            | Cards, galeria e resumo passam a usar a mesma mídia por cor. |
| Kit Seleção com placeholder          | Composição reproduzível feita a partir de três recortes oficiais de camisetas.                                 | `public/assets/products/kit/`, `scripts/assets/create-launch-product-media.mjs` | Asset 4:5 sem fotografia inventada.                          |
| Swatches apenas decorativos          | Swatches dos cards agora trocam a mídia por hover, foco ou toque e mantêm o estado selecionado.                | `ProductGrid.tsx`, `ProductGrid.module.css`                                     | Botões possuem nome acessível e área de toque de 44px.       |
| Catálogo mobile comprimido           | Grade passa a uma coluna abaixo de 680px.                                                                      | `ProductGrid.module.css`                                                        | Título, preço e cor permanecem legíveis em 360px.            |
| Rodapé excessivo em páginas internas | A home mantém a versão editorial; rotas públicas internas usam versão compacta.                                | `SiteFooter*.tsx`, `SiteFooter.module.css`                                      | Admin não recebe rodapé público.                             |
| 404 em inglês                        | Criada página 404 em português com retorno à coleção.                                                          | `app/not-found.tsx`                                                             | Rota inexistente segue a identidade ART.                     |

## Adiado por conteúdo não confirmado

Consulte `docs/content/LAUNCH_CONTENT_GAPS.md` para medidas, composição, cuidados, políticas,
prazo de produção, frete nacional e mídia ainda não fornecida da Solid logo central.
