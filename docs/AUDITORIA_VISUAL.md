# Auditoria visual e UX - antes do redesign

Data: 23/06/2026. Base auditada: `main` sincronizada em `412c48a` antes da criação de `feat/redesign-editorial-premium`.

## Evidências revisadas

- Home desktop e mobile registradas em `docs/design-review/before/`.
- Componentes de home, catálogo, produto, Kit, carrinho, checkout, header, footer e páginas legais.
- Fluxos existentes cobertos por `tests/e2e/main-flow.spec.ts` e testes de domínio.

## Problemas encontrados

### Hierarquia e narrativa

- O hero apresenta ART, slogan, três CTAs, três selos e três mockups simultaneamente. A primeira decisão comercial não é evidente.
- A home salta diretamente para o catálogo e não explica coleção, função, Kit ou operação em uma sequência editorial.
- Header também repete a intenção de compra com o botão `Comprar`, enquanto o hero já oferece dois caminhos de compra.

### Tipografia

- Arial/Helvetica e pesos 900/950 aparecem como principal mecanismo de contraste.
- Títulos, categorias, botões, selos e metadados usam caixa alta de forma semelhante, nivelando o conteúdo.
- A escala no mobile reduz a leitura de dados de produto e preço.

### Espaçamento e grid

- O hero usa uma divisão rígida texto/produto. Os três mockups não têm relação com um grid editorial único.
- Catálogo, controles, filtros e cards competem pela mesma faixa superior no desktop; no mobile a sequência fica longa e sem variação de ritmo.
- Carrinho, checkout e produto usam caixas próximas entre si em vez de priorizar blocos de decisão.

### Bordas e ruído visual

- Há contornos em botões, selos, cards, controles, galeria e resumos, ainda quando não comunicam estado ou estrutura.
- A barra superior mostra três mensagens pequenas ao mesmo tempo.
- A marca é repetida em logo, título e watermark sem uma função distinta em cada caso.

### Imagem e placeholders

- O hero central contém um mockup dentro de retângulo branco perceptível sobre fundo escuro.
- Os mockups laterais parecem cartões inclinados, não parte de uma campanha.
- Placeholders usam ART grande sem uma linguagem de pendência integrada ao sistema.
- A galeria de produto exibe os mockups em molduras uniformes, não alternando fundos ou escala.

### Mobile

- A home se torna uma pilha automática: hero comprimido, três CTAs em largura total e catálogo com cards repetitivos.
- O header não expõe navegação de produtos/contato no mobile, apenas o carrinho.
- A hierarquia de filtro, busca e ordenação é alta demais antes do primeiro produto.

### Acessibilidade

- O estado de swatch depende sobretudo da aparência visual e poderia ter texto de estado mais claro.
- O menu mobile precisa de um padrão de diálogo com foco controlado; a navegação atual é apenas ocultada.
- Há contraste frágil em alguns metadados claros sobre fundos cinza e itens em caixa alta pequenos.

## Elementos a preservar

- Sete ofertas, preços e regras de operação confirmadas.
- Seleção de cor, tamanho, quantidade e a configuração independente das três peças do Kit.
- Carrinho em `localStorage`, cupom `PRIMEIRACOMPRA`, cálculo de entrega e preparação de pedido no WhatsApp.
- Textos honestos sobre sob encomenda, frete e pagamento assistido.
- Mídia por SKU/cor e placeholders explícitos quando o asset correto não existe.

## Riscos de regressão

- Alterar markup de produto pode quebrar seleção de cor, kit e `data-testid="add-to-cart"`.
- Um header cliente não pode impedir exportação estática nem degradar navegação sem JavaScript.
- Galerias grandes precisam preservar `width`/`height`, `priority` apenas acima da dobra e `alt` correto.
- CTAs e labels do checkout dependem dos seletores dos testes e devem continuar semanticamente equivalentes.
- O redesign não deve introduzir dependências pesadas, carrosséis obrigatórios, scroll hijacking ou pagamento/frete fictícios.
