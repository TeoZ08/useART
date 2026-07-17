# Auditoria final — Commerce Production V1

Data: 10 de julho de 2026

## Estado auditado

- branch: `feat/commerce-production-v1`;
- PR: #9, aberto e draft;
- frontend público e hero 3D preservados;
- Supabase staging ativo;
- owner com acesso administrativo e TOTP confirmado pelo responsável;
- Mercado Pago de teste configurado somente no Preview e pagamentos de staging habilitados pelo owner;
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

Status: **APRO executado manualmente; persistência do webhook ainda não comprovada no staging consultado**.

| Verificação                                 | Estado                                                                |
| ------------------------------------------- | --------------------------------------------------------------------- |
| preferência usa `sandbox_init_point`        | aprovado: resposta `sandbox=true` e host `sandbox.mercadopago.com.br` |
| pagamento aprovado                          | executado manualmente pelo responsável                                |
| pagamento rejeitado/cancelado               | pendente de execução final                                            |
| assinatura e campos obrigatórios do webhook | contrato automatizado aprovado; staging não registrou evento real     |
| valor e `external_reference` conferidos     | preferência valida valor; confirmação do provider pendente            |
| idempotência                                | mesma chave publicada e nova chave automatizada aprovadas             |
| acompanhamento público                      | aprovado para o pedido sandbox criado                                 |
| painel administrativo                       | owner/MFA confirmado; pedido sandbox não conferido no painel          |
| logs sem segredo                            | aprovado nos eventos auditados                                        |

O banco de staging consultado em 10 de julho contém duas preferências sandbox, ambas ainda em
`preference_created`, sem `provider_payment_id`; `payment_webhook_events` está vazio. Portanto, o
APRO manual não deve ser considerado encerrado até identificar a preferência usada e confirmar a
entrega do webhook ou a reconciliação por retorno. Duas chamadas com a mesma chave retornam a mesma
preferência. A correção adicional também reutiliza a preferência ativa quando o navegador retorna
com outra chave; uma tentativa rejeitada ou cancelada continua liberando nova preferência.

Nesta rodada, a loja ganhou conta opcional por magic link, pedidos filtrados no servidor pelo e-mail
confirmado e rota privada de detalhes. Checkout continua sem cadastro obrigatório. Pix e cartão não
são excluídos da preferência; a disponibilidade final precisa ser confirmada no painel Mercado Pago.

O bloqueio histórico de login da conta Comprador de teste foi resolvido pelo responsável, que executou
o APRO manualmente. A próxima intervenção humana é identificar a preferência/pagamento desse teste
no painel Mercado Pago e disparar uma rejeição controlada somente depois de este Preview publicar.

Referência: [compras de teste do Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-test/test-purchases).

## Gates de Production

- variáveis base de Production: **ausentes**;
- credenciais Mercado Pago live: **ausentes por decisão correta**;
- domínio público pós-merge: pendente de smoke;
- Site URL, Redirect URLs e templates de Auth no Supabase staging: pendentes de conferência humana no painel;
- aprovação humana para merge: pendente;
- ativação de pagamento live: bloqueada até sandbox e webhook concluídos.

## Decisão provisória

**NÃO MERGEAR AINDA**. Publicar este Preview, identificar a preferência do APRO manual, confirmar
webhook/reconciliação e executar uma rejeição controlada. Depois, configurar a base segura de
Production mantendo pagamentos desativados e solicitar nova decisão humana.
