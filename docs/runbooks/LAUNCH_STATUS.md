# Status de preparação para lançamento

- **Checkpoint:** 2026-07-17 19:27:43 -04
- **PR:** [#9 — Commerce Production V1](https://github.com/TeoZ08/useART/pull/9), merged
- **Squash commit:** `b02a2949f507cdb6cd5ae00637392a12e78cdf0a` — `Implementa Commerce Production V1`
- **Deployment de Production:** `dpl_8jPxkFTTv4TsHHfLkwKFiRnwuGrX`, READY
- **Domínio:** https://useart.vercel.app

## Verificação realizada

- Smoke test somente leitura concluído em Production: home, hero, catálogo, produto (cor, tamanho e CTA), carrinho vazio, checkout vazio, conta e redirecionamento do admin para login.
- Nenhum pedido, preferência de pagamento ou compra foi criado após o merge.
- Autenticação da Vercel foi reativada somente para Deployments Preview. O domínio de Production não recebeu proteção adicional.

## Estado de pagamentos

Pagamentos live não foram ativados nem configurados nesta etapa. A configuração de Production precisa ser conferida no cutover; `PAYMENTS_ENABLED` não foi alterada e deve permanecer desativada até a ativação controlada.

## Pendências para lançamento

1. Conferir credenciais live.
2. Configurar webhook live.
3. Ativar `PAYMENTS_ENABLED`.
4. Executar uma única compra real controlada.
5. Confirmar pedido, webhook, conta e admin.
6. Somente então divulgar a loja.
