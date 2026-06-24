# Sistema de interface - ART editorial técnico

## Intent

**Usuário:** cliente mobile-first da ART e operação que recebe pedidos pelo WhatsApp.

**Tarefa principal:** descobrir uma peça, configurar cor/tamanho ou o Kit Seleção, revisar o pedido e abrir uma mensagem estruturada no WhatsApp.

**Sensação desejada:** streetwear funcional, urbano, autoral e preciso. A compra deve permanecer direta, legível e honesta.

## Domain

Streetwear, conforto em movimento, camiseta híbrida, proteção UV 30, moletom três cabos, sob encomenda, Kit Seleção, variações, carrinho, retirada, entrega local e pedido assistido.

## Color world

- `ink`: `#090909` para fundos de campanha, títulos e contraste.
- `ink-soft`: `#161616` para superfícies escuras secundárias.
- `paper`: `#F1EFEA` para o fundo quente principal.
- `paper-strong`: `#FAF9F6` para campos e superfícies claras.
- `mineral`: `#B8B4AC` para dados secundários e divisórias.
- `brown`: cor derivada das peças; nunca acento global do produto.

## Tipografia

- **Display:** `Barlow Condensed` para títulos, numeração editorial e chamadas de coleção.
- **Interface:** `Manrope` para preço, controles, textos e formulários.
- Uma família não pode substituir a outra. Peso, escala e caixa criam a hierarquia; `900` não é usado como atalho visual.

## Grid, spacing e profundidade

- Grid de 12 colunas a partir de 1024px, com margem lateral fluida e largura máxima de `1600px`.
- Mobile é uma composição própria em uma coluna, com respiro lateral de `20px`.
- Escala: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160px`.
- A profundidade vem de blocos planos, contraste e recortes; sombras são reservadas à peça de produto e são sutis.
- Bordas só definem controles, formulários, separadores e estados. Seções da página não recebem moldura de cartão.

## Assinatura

Uma peça recortada em grande escala ou uma camiseta 3D transparente cruza uma tipografia editorial limpa, com marca e dados de operação ocupando posições distintas no mesmo grid. Quando houver movimento, poster estático, reduced motion e economia de dados devem preservar a composição sem depender da animação.

## Estados interativos

- Links usam sublinhado de progresso ou troca leve de cor, não movimentos longos.
- Cor e tamanho selecionados têm estado de seleção textual e foco visível.
- Botões primários mantêm uma área mínima de toque de `48px`.
- Menu mobile usa `dialog`, fecha com Escape e devolve o foco ao botão de abertura.
- Mensagens de carrinho, erro e pendência têm estrutura semântica e contraste suficiente.

## Acessibilidade e movimento

- Landmarks e sequência de headings são obrigatórios.
- Ícones possuem rótulo acessível; ícones decorativos usam `aria-hidden`.
- O foco é visível em qualquer fundo.
- `prefers-reduced-motion` remove transformações e reveals não essenciais sem perder conteúdo ou controles.

## Defaults rejeitados

- Hero em duas colunas com mockup em cartão branco: usar uma peça recortada integrada ao grid editorial.
- Catálogo de marketplace com cards fechados: usar imagens grandes, informações compactas e blocos abertos.
- Três CTAs concorrentes e selos: preservar uma ação primária por bloco e dados operacionais curtos.
- Gradientes azul/roxo, glassmorphism, sombras pesadas e cores de acento aleatórias: não fazem parte da linguagem ART.

## Limites de conteúdo

Não inventar composição, medidas, políticas, disponibilidade, fotos de pessoas ou integração de pagamento/frete. Placeholders precisam informar a pendência com intenção visual, sem simular um asset inexistente.
