# Webhook de pagamento

O endpoint aceita somente corpo limitado, valida `x-signature`, `x-request-id` e `data.id`, busca o pagamento no provider e compara pedido e valor no servidor. Eventos duplicados são idempotentes.

Os fluxos público e administrativo de criação de preferência usam `MERCADO_PAGO_WEBHOOK_URL` como `notification_url` quando a variável server-only está configurada. O valor pode conter o bypass de um Preview protegido e é encaminhado integralmente, sem remover query parameters. Sem override, a aplicação usa `/api/webhooks/mercadopago` no `siteUrl` atual.

Nunca registre o valor de `MERCADO_PAGO_WEBHOOK_URL`: a query string pode conter uma credencial de bypass. Respostas ao cliente também não devem incluir a notification URL.

A URL não substitui a autenticação do evento. O webhook continua exigindo:

- `x-signature` válida com `MERCADO_PAGO_WEBHOOK_SECRET`;
- `x-request-id`;
- `data.id` (ou `id` compatível enviado pelo provider);
- vínculo entre pagamento, pedido e valor;
- processamento idempotente por evento e tentativa.

Em incidente, consulte `payment_webhook_events`, `payment_attempts` e `audit_logs`; não altere um pedido para pago manualmente sem evidência do provider. Reprocesse apenas depois de preservar o evento e confirmar assinatura, external reference e total.

O retorno de Checkout Pro pode chamar `/api/pagamentos/reconciliar` com o `payment_id` retornado pelo
Mercado Pago. Esse endpoint é limitado por origem e rate limit, consulta o provider no servidor e
aplica exatamente as mesmas validações de referência externa e valor. Use-o como fallback observável,
não como justificativa para desativar ou ignorar o webhook.
