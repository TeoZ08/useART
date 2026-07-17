# useART — Auditoria de UX e polimento pré-publicação

## Objetivo

Realizar uma última auditoria visual e funcional da loja useART antes do merge da PR #9, corrigindo problemas de UX comprovados sem redesenhar a identidade existente nem adicionar funcionalidades novas.

A auditoria deve preservar:

- hero 3D e comportamento atual da camiseta;
- identidade visual ART;
- catálogo, produto, carrinho e checkout existentes;
- checkout sem cadastro obrigatório;
- conta opcional do cliente;
- Supabase staging;
- painel administrativo;
- integração Mercado Pago Checkout Pro;
- Pix e cartão disponíveis no Checkout Pro;
- comportamento seguro já comprovado dos pedidos.

---

## Estado funcional já comprovado

- Branch: `feat/commerce-production-v1`
- PR: `#9`
- Preview funcional na Vercel.
- Pagamento sandbox aprovado comprovado:
  - pedido `ART-202607-000006`;
  - valor `R$ 45,00`;
  - `payment_status = approved`;
  - `status = paid`;
  - exibido corretamente no admin e na conta do cliente.
- Pedidos de teste não concluídos foram cancelados.
- Production ainda não deve ser alterada.
- Não repetir pagamentos sandbox durante a auditoria visual.
- O teste formal de rejeição não foi concluído por limitações do sandbox do Mercado Pago, mas pedidos sem aprovação permaneceram sem virar `paid`.

---

# Problemas de UX já observados

## P0 — bloqueia publicação

Nenhum bloqueio funcional crítico foi comprovado após o pagamento aprovado persistir corretamente.

A auditoria ainda deve verificar se existe algum P0 não identificado, especialmente em mobile, checkout e recuperação de erros.

---

## P1 — corrigir antes da publicação

### UX-01 — Texto contraditório sobre pagamento no checkout

O checkout informa que os pagamentos online permanecem desativados, embora o Mercado Pago esteja habilitado e o cliente receba uma ação para pagar.

**Risco:** abandono e perda de confiança.

**Direção esperada:**

> Após criar o pedido, você será direcionado ao Mercado Pago para pagar com Pix ou cartão.

O texto deve respeitar feature flags e o ambiente real.

---

### UX-02 — Cupom é validado enquanto o usuário ainda digita

A interface mostra erro de cupom antes de o código estar completo.

**Risco:** feedback prematuro e sensação de falha.

**Direção esperada:**

- validar ao clicar em `Aplicar cupom`; ou
- validar após debounce razoável e somente com entrada completa.

---

### UX-03 — Mensagem de cupom expõe linguagem interna

Mensagem observada:

> A validação definitiva de uso deve ocorrer no servidor.

Isso é linguagem de implementação.

**Direção esperada:**

> Cupom aplicado: 10% de desconto.

Ou uma mensagem igualmente clara para cliente final.

---

### UX-04 — Duas páginas de acompanhamento cumprem funções parecidas

A página logo após criar o pedido é muito simples, enquanto a página acessada pelo token mostra informações mais completas.

**Risco:** redundância e experiência inconsistente.

**Direção esperada:**

- usar a página completa como destino principal após a criação; ou
- reaproveitar o mesmo componente/estrutura nas duas rotas;
- evitar duas experiências distintas para o mesmo pedido.

---

### UX-05 — Página “Ver detalhes” da conta do cliente é redundante

Na lista de pedidos, o botão `Ver detalhes` abre uma página que praticamente repete o mesmo card.

**Direção esperada:**

A página de detalhes deve mostrar informações realmente adicionais:

- itens e variações;
- quantidade;
- subtotal, desconto, frete e total;
- método de entrega;
- endereço quando aplicável;
- status em linguagem humana;
- próxima ação;
- histórico essencial.

Caso essas informações não sejam exibidas, remover o botão é melhor do que manter uma página redundante.

---

### UX-06 — Nova tentativa de pagamento não é evidente

Pedidos em `awaiting_payment` não deixam claro para o cliente como retomar o Checkout Pro.

**Direção esperada:**

- CTA visível: `Continuar pagamento`;
- texto breve explicando o estado;
- evitar a criação desnecessária de novos pedidos;
- reutilizar a preferência válida quando a regra atual permitir.

---

### UX-07 — Código do pedido no admin não parece clicável

Na tabela administrativa, o código é um link, mas visualmente parece texto comum.

**Direção esperada:**

- affordance explícita;
- sublinhado, ícone ou estado hover perceptível;
- eventualmente ação `Abrir pedido`.

---

### UX-08 — Cancelamento administrativo está escondido

A ação de cancelamento existe apenas no fim da página longa de detalhes.

**Risco:** operador acredita que não consegue cancelar.

**Direção esperada:**

- ação contextual perto do cabeçalho ou em uma área fixa de ações;
- preservar confirmação e motivo obrigatório;
- respeitar as regras atuais que impedem cancelar pedido pago.

---

### UX-09 — Status administrativos aparecem em inglês técnico

Exemplos:

- `awaiting_payment`;
- `paid`;
- `not_created`;
- `approved`;
- `cancelled`;
- `pickup`;
- `local_delivery`.

**Direção esperada:**

Exibir rótulos em português, preservando os valores internos no banco:

- Aguardando pagamento;
- Pago;
- Pagamento não iniciado;
- Aprovado;
- Cancelado;
- Retirada;
- Entrega local.

---

### UX-10 — Lista de pedidos do admin não oferece ações rápidas

A tabela mostra dados, mas não deixa claro como abrir ou agir sobre um pedido.

**Direção esperada:**

- coluna ou menu `Ações`;
- `Abrir`;
- eventualmente `Cancelar`, quando permitido;
- não duplicar lógica de autorização ou transição.

---

### UX-11 — Ações importantes ficam muito abaixo na página administrativa

Detalhes, notas, cancelamento, pagamentos e histórico formam uma página extensa.

**Direção esperada:**

- reorganizar por prioridade;
- colocar resumo e ações operacionais no topo;
- usar seções recolhíveis apenas quando isso simplificar;
- não esconder informações essenciais.

---

### UX-12 — Página criada após o pedido possui muito espaço vazio

O código do pedido domina a tela, mas status, itens, total e próxima ação têm pouco destaque.

**Direção esperada:**

Priorizar:

1. status;
2. próxima ação;
3. total;
4. entrega;
5. itens;
6. código do pedido como referência secundária.

---

### UX-13 — Total final no checkout transmite incerteza

Mensagem observada em torno de:

> Total final — exibido após confirmar.

Mesmo com validação server-side correta, isso pode gerar insegurança.

**Direção esperada:**

> Total estimado: R$ X — confirmado ao criar o pedido.

Exibir claramente o que já está calculado e o que ainda pode mudar.

---

### UX-14 — Campos obrigatórios não são marcados de forma consistente

E-mail aparece como opcional, mas nome e WhatsApp não deixam explícita a obrigatoriedade.

**Direção esperada:**

- marcar obrigatórios de forma consistente;
- explicar erros junto ao campo;
- manter linguagem curta.

---

### UX-15 — Nome da cor está distante dos controles

As opções usam círculos visuais, mas o rótulo textual da cor não está diretamente associado ao seletor.

**Risco:** acessibilidade e ambiguidade.

**Direção esperada:**

- mostrar o nome da cor selecionada junto aos controles;
- adicionar `aria-label` ou texto acessível;
- preservar os swatches.

---

### UX-16 — Título do produto compete com a ação de compra

O título editorial é muito grande e empurra preço, variações e CTA para baixo em telas menores.

**Direção esperada:**

- reduzir escala de forma responsiva;
- manter impacto visual;
- trazer a decisão de compra para a primeira dobra quando possível.

---

## P2 — melhoria posterior ou condicionada à auditoria

### UX-17 — Painel administrativo precisa de melhor hierarquia operacional

O painel funciona, mas ainda parece uma interface técnica.

Possíveis melhorias:

- resumo de pedidos aguardando pagamento;
- indicadores de pedidos pagos;
- filtros com rótulos em português;
- ações mais evidentes;
- densidade e legibilidade da tabela.

Não criar dashboards complexos agora.

---

### UX-18 — Página de detalhes do cliente pode ter histórico simplificado

Exibir apenas eventos relevantes para o cliente:

- pedido criado;
- pagamento aprovado;
- em produção;
- pronto/enviado;
- entregue.

Não expor nomes internos de eventos ou fontes técnicas.

---

### UX-19 — Melhorar feedback de carregamento e transições

Auditar:

- criação do pedido;
- geração/reutilização da preferência;
- retorno de pagamento;
- aplicação de cupom;
- troca de cor;
- adição ao carrinho.

Não adicionar animações excessivas.

---

# Áreas ainda não auditadas visualmente

Estas áreas devem ser verificadas pelo navegador automatizado e manualmente quando necessário:

## Fluxo público

- responsividade mobile da home;
- menu mobile;
- produto em 360–390 px;
- carrinho mobile;
- checkout mobile;
- carrinho vazio;
- remoção de item;
- limpeza do carrinho;
- edição de quantidade;
- Kit Seleção;
- produto com mídia incompleta ou provisória;
- entrega local e endereço;
- cotação nacional;
- páginas de pagamento:
  - sucesso;
  - pendente;
  - falha;
- contato;
- entrega;
- trocas;
- privacidade;
- termos;
- links do rodapé;
- estados de erro e páginas 404.

## Conta do cliente

- formulário de magic link;
- mensagens de envio;
- acesso com e-mail sem pedidos;
- lista com múltiplos pedidos;
- pedido pago;
- pedido aguardando pagamento;
- sair da conta;
- comportamento mobile.

## Admin

- resumo;
- produtos;
- edição e criação de produto;
- pedidos;
- detalhes;
- cupons;
- configurações;
- auditoria;
- estados vazios;
- filtros;
- comportamento em notebook menor;
- responsividade mínima necessária.

---

# Comportamentos aprovados que devem ser preservados

- hero 3D e rotação da camiseta;
- fallback visual;
- troca de cor e mídia do produto;
- seleção de tamanho;
- quantidade;
- cálculo do carrinho;
- aplicação do cupom existente;
- opções de entrega;
- checkout sem conta obrigatória;
- conta opcional;
- Mercado Pago Checkout Pro;
- pagamento aprovado persistindo como `approved / paid`;
- bloqueio de cancelamento para pagamento aprovado;
- cancelamento com confirmação e motivo;
- identidade visual preta, branca e editorial da ART;
- footer com movimento visual.

Não redesenhar a loja do zero.

---

# Estratégia recomendada

## Não fazer merge apenas para permitir a auditoria

O melhor caminho é manter a PR #9 em draft enquanto o polimento é realizado.

Motivos:

- `main` e Production continuam sendo o ponto estável de rollback;
- o problema anterior era acesso ao Preview protegido, não incapacidade do navegador de testar a aplicação;
- o Codex local pode abrir `localhost`;
- uma auditoria visual não depende de webhook público nem pagamento real;
- o merge deve representar a versão pronta para publicação, não uma etapa intermediária.

## Executar localmente

Na branch atual:

```bash
cd /home/matteo/ProjetosPessoais/useART
git status --short
git branch --show-current
npm install
npm run dev
```

Usar:

```text
http://127.0.0.1:3000
```

O agente local deve usar Playwright ou `agent-browser` contra `localhost`.

Para auditoria visual, não executar pagamentos Mercado Pago.

Caso o projeto precise de comportamento equivalente à Vercel, usar apenas as variáveis locais de staging já existentes. Não copiar secrets para prompts e não usar Production.

---

# Fluxo de trabalho otimizado para o Codex

1. Ler este arquivo.
2. Confirmar branch e worktree.
3. Iniciar a aplicação local.
4. Auditar desktop e mobile com navegador.
5. Registrar achados adicionais no próprio arquivo.
6. Corrigir apenas P0 e P1.
7. Não adicionar novas funcionalidades.
8. Rodar testes direcionados.
9. Fazer nova passagem visual.
10. Atualizar status dos itens:
    - resolvido;
    - mantido;
    - adiado.
11. Fazer um único commit coeso.
12. Push para a branch atual.
13. Manter PR #9 como draft até validação humana.

---

# Preparação do arquivo no projeto

Depois de baixar este Markdown, copie-o para:

```bash
mkdir -p /home/matteo/ProjetosPessoais/useART/docs/ux
cp ~/Downloads/useart_auditoria_ux_pre_publicacao.md \
  /home/matteo/ProjetosPessoais/useART/docs/ux/UX_AUDIT_PRELAUNCH.md
```

Ajuste o caminho de `Downloads` caso o navegador tenha salvado em outro local.

O novo chat do Codex deve receber apenas o prompt abaixo. Todo o restante do contexto ficará neste arquivo versionável.

---

# Prompt curto para um novo chat no Codex

```text
Trabalhe no repositório:

/home/matteo/ProjetosPessoais/useART

Branch esperada:

feat/commerce-production-v1

Leia primeiro:

docs/ux/UX_AUDIT_PRELAUNCH.md

Objetivo:

realizar a auditoria e o polimento de UX pré-publicação da useART, usando a aplicação local e preservando a identidade visual e as funcionalidades existentes.

Regras:

- Não fazer merge.
- Não alterar Production.
- Não alterar credenciais, webhooks ou configurações externas.
- Não fazer pagamentos.
- Não redesenhar a loja do zero.
- Não implementar funcionalidades que não estejam ligadas a problemas de UX comprovados.
- Não repetir auditorias técnicas gerais já concluídas.
- Não gerar relatório longo no chat.
- Não expor secrets.
- Trabalhar na branch atual.
- Manter a PR #9 como draft.

Execução:

1. Confirme branch e worktree.
2. Inicie a aplicação local.
3. Use Playwright ou agent-browser em http://127.0.0.1:3000.
4. Audite:
   - desktop 1440 × 900;
   - notebook 1024 × 768;
   - mobile 390 × 844;
   - mobile 360 × 800.
5. Percorra:
   - home;
   - catálogo;
   - produto;
   - carrinho;
   - checkout sem concluir pagamento;
   - acompanhamento;
   - conta;
   - admin.
6. Leia os problemas já registrados no Markdown.
7. Acrescente apenas achados novos e comprovados.
8. Corrija todos os itens P0 e P1 que sejam seguros e compatíveis com o escopo.
9. Preserve hero 3D, branding, regras de negócio, Supabase staging e Mercado Pago.
10. Rode somente:
    - formatação/lint dos arquivos alterados;
    - typecheck;
    - testes relacionados às áreas alteradas;
    - build apenas no checkpoint final.
11. Faça nova passagem visual nas quatro resoluções.
12. Atualize o Markdown com:
    - resolvido;
    - adiado;
    - novo achado;
    - evidência.
13. Faça um único commit coeso e push na branch atual.
14. Não marque a PR como pronta e não faça merge.

Entrega final curta:

- problemas corrigidos;
- problemas adiados;
- novos problemas encontrados;
- rotas verificadas;
- testes executados;
- commit;
- recomendação: liberar ou não liberar para revisão final humana.
```

---

# Critério para merge posterior

## Registro de execução — 2026-07-17

### Evidência consolidada

- Não há P0 de aplicação reproduzível. A ausência inicial de hidratação era causada por uma sessão
  local inconsistente do Next; uma instância limpa em `127.0.0.1:3100` e o servidor de produção
  local em `127.0.0.1:3101` hidrataram menu e carrinho normalmente.
- Não foram criados pedidos nem executados pagamentos durante esta auditoria.

### P1 resolvidos

- UX-01, UX-13 e UX-14: checkout comunica a continuidade para Mercado Pago, mostra total
  estimado e marca os campos obrigatórios.
- UX-02 e UX-03: cupom é aplicado por ação explícita e usa mensagem para cliente final.
- UX-04 e UX-12: após criar o pedido, a navegação segue para a página completa de acompanhamento.
- UX-05 e UX-06: detalhes da conta mostram itens, seleções, valores, entrega e próxima ação;
  pedidos pendentes oferecem `Continuar pagamento` com explicação de retomada.
- UX-07 a UX-11: administração usa rótulos em português, links e ações explícitas; o atalho de
  cancelamento fica no topo e preserva confirmação, motivo e bloqueio de pedido pago.
- UX-15 e UX-16: o nome da cor selecionada foi aproximado dos swatches e a escala do título foi
  reduzida no mobile.

### Adiado

- UX-17 a UX-19 permanecem como melhoria posterior, sem dashboard novo ou animações adicionais.
- Novo achado P2: a página 404 ainda usa a mensagem padrão em inglês; fora do escopo desta rodada.

### Validações

- `npm run lint`
- `npx tsc --noEmit`
- testes de domínio para cupom, carrinho e validação
- fluxos Playwright de menu mobile, catálogo/produto/carrinho e erros de assets
- `npm run build`

Fazer merge somente após:

- P0 inexistentes;
- P1 resolvidos ou conscientemente aceitos;
- mobile revisado;
- build e checks verdes;
- revisão humana rápida no Preview;
- textos de pagamento coerentes;
- conta e admin compreensíveis;
- Production configurada com pagamentos inicialmente desativados;
- plano de rollback confirmado.

Após o merge:

1. smoke test em Production;
2. confirmar conteúdo e navegação;
3. configurar credenciais live;
4. manter pagamentos desligados;
5. ativar de forma controlada;
6. executar uma compra real de baixo valor;
7. confirmar pedido, pagamento e operação.
