# Operação de pedidos

- `owner`, `admin` e `operator` acessam pedidos conforme as políticas.
- Cotação nacional deve registrar valor e prazo antes da mudança de status.
- Toda mudança deve ocorrer pelas ações do painel, que produzem auditoria.
- Cancelamento não apaga pedido, itens, tentativas ou histórico.
- O token público permite apenas leitura do pedido correspondente e não expõe PII administrativa.
- Não confirme pagamento por mensagem do cliente; valide no provider e no webhook.
