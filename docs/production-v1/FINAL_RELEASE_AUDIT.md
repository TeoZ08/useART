# Auditoria final — Commerce Production V1

Data: 8 de julho de 2026

## Estado auditado

- branch: `feat/commerce-production-v1`;
- PR: #9, aberto e draft;
- frontend público e hero 3D preservados;
- Supabase staging ativo;
- owner com acesso administrativo e TOTP confirmado pelo responsável;
- Mercado Pago de teste configurado somente no Preview;
- Production não alterada;
- Render mantido apenas como legado/rollback.

## Evidências desta rodada

- GitGuardian aprovou os commits auditados;
- variáveis Mercado Pago live não existem em Production;
- o Preview possui as variáveis exigidas por nome e escopo, sem valores inspecionados;
- convite e recovery agora chegam a uma tela de definição de senha com política forte e erro seguro;
- redirects esperados do Supabase estão documentados, mas a configuração remota ainda requer conferência humana no painel;
- o gate local passou em format, lint, TypeScript, unitários, integração, segurança, E2E, build e audit;
- o smoke publicado confirmou home, hero 3D, catálogo e rota segura de recovery sem erro de console;
- 500 eventos de runtime do Preview foram auditados sem 401/403/409/413/500 e sem sinal de segredo ou token em mensagens.

## Sandbox Mercado Pago

Status: **parcialmente aprovado — bloqueado por login da conta Comprador de teste**.

| Verificação                                 | Estado                                                                |
| ------------------------------------------- | --------------------------------------------------------------------- |
| preferência usa `sandbox_init_point`        | aprovado: resposta `sandbox=true` e host `sandbox.mercadopago.com.br` |
| pagamento aprovado                          | bloqueado antes do checkout pela ausência do login Comprador de teste |
| pagamento rejeitado/cancelado               | bloqueado pelo mesmo gate externo                                     |
| assinatura e campos obrigatórios do webhook | contrato automatizado aprovado; entrega real não ocorreu              |
| valor e `external_reference` conferidos     | valor aprovado; referência E2E depende do pagamento                   |
| idempotência                                | mesma chave publicada e nova chave automatizada aprovadas             |
| acompanhamento público                      | aprovado para o pedido sandbox criado                                 |
| painel administrativo                       | owner/MFA confirmado; pedido sandbox não conferido no painel          |
| logs sem segredo                            | aprovado nos eventos auditados                                        |

O pedido `ART-202607-000005`, com retirada e total de R$ 45,00, gerou uma única tentativa e preferência de teste. Duas chamadas com a mesma chave retornaram a mesma URL. A correção adicional também reutiliza a preferência ativa quando o navegador retorna com outra chave; uma tentativa rejeitada ou cancelada continua liberando nova preferência.

Ao abrir o Checkout Pro, o sandbox respondeu “Hubo un error accediendo a esta pagina”. O fluxo oficial exige que o navegador esteja autenticado previamente com a conta Comprador de teste da aplicação. Não foi usada conta pessoal, credencial live ou cartão real.

### Intervenção humana necessária

1. Em Mercado Pago Developers, abra **Suas integrações > aplicação useART > Contas de teste > Comprador**.
2. Em uma janela anônima, faça login com o usuário e a senha dessa conta. Se solicitado, use o código de verificação de 6 dígitos mostrado na mesma tela.
3. Abra o Preview protegido, crie um pedido de retirada e clique em **Pagar com Mercado Pago**.
4. Use cartão de teste oficial e titular `APRO` para o cenário aprovado; nunca use cartão real.
5. Crie outro pedido e use titular `OTHE` para o cenário rejeitado.
6. Em ambos, confirme pedido, tentativa, webhook, acompanhamento e painel antes de mudar qualquer gate live.

Referência: [compras de teste do Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-test/test-purchases).

## Gates de Production

- variáveis base de Production: **ausentes**;
- credenciais Mercado Pago live: **ausentes por decisão correta**;
- domínio público pós-merge: pendente de smoke;
- Site URL, Redirect URLs e templates de Auth no Supabase staging: pendentes de conferência humana no painel;
- aprovação humana para merge: pendente;
- ativação de pagamento live: bloqueada até sandbox e webhook concluídos.

## Decisão provisória

**NÃO MERGEAR AINDA**. Concluir aprovado + rejeitado com a conta Comprador de teste, confirmar webhook e visualizar os pedidos no admin. Depois, configurar a base segura de Production mantendo pagamentos desativados e solicitar nova decisão humana.
