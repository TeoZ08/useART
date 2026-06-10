# Sistema de interface — use.a.r.t

## Intent

Usuário: cliente de loja e responsável pela manutenção local do catálogo.

Tarefa principal: encontrar uma camiseta, escolher variação, montar carrinho e finalizar pedido pelo WhatsApp.

Sensação desejada: simples, comercial, confiável e direta, sem aparência de demo.

## Domain

Streetwear, camisetas, catálogo, variações, carrinho, checkout, WhatsApp, retirada, pagamento, marca própria.

## Color World

- Preto profundo para header, hero e contraste de marca.
- Off-white/cinza claro para superfície principal.
- Branco para texto sobre fundo escuro e áreas de produto.
- Marrom como cor natural de produto e apoio visual.
- Cinza neutro para bordas, metadados e estados secundários.

## Signature

Produto em destaque com recortes grandes, marca `use.a.r.t` em presença visual forte e checkout direto pelo WhatsApp.

## Defaults a rejeitar

- Layout genérico de marketplace com cards sem identidade; preferir presença de marca e produto real.
- Admin local apresentado como seguro; preferir aviso honesto de MVP.
- Excesso de texto institucional; preferir fluxo de compra claro.

## Tokens e padrões atuais

- Tipografia: Arial/Helvetica, peso alto para navegação, chamadas e preços.
- Superfícies: fundo `#efefed`, header/hero em preto, cards brancos ou neutros.
- Depth: sombras sutis e diferenças de superfície, sem efeitos pesados.
- Bordas: linhas finas em cinza ou branco translúcido.
- Espaçamento: seções amplas no catálogo e controles compactos no header.

## Estados interativos

- Botões de cor e tamanho devem indicar seleção ativa.
- Botões desabilitados usam opacidade reduzida.
- Carrinho precisa manter badge de quantidade legível.
- Formulários devem exibir erros próximos ao campo.

## Acessibilidade e responsividade

- Manter labels/aria-labels em ícones de carrinho, busca, admin e fechar.
- Garantir contraste suficiente nos fundos escuros.
- Preservar foco por teclado em cards e botões.
- Evitar textos longos em botões no mobile.

## Limites

Não alterar a identidade visual sem validação da marca. O admin local é apenas ferramenta de demonstração e manutenção do MVP estático.
