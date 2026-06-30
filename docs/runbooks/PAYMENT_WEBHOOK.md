# Webhook de pagamento

O endpoint aceita somente corpo limitado, valida `x-signature`, `x-request-id` e `data.id`, busca o pagamento no provider e compara pedido e valor no servidor. Eventos duplicados são idempotentes.

Em incidente, consulte `payment_webhook_events`, `payment_attempts` e `audit_logs`; não altere um pedido para pago manualmente sem evidência do provider. Reprocesse apenas depois de preservar o evento e confirmar assinatura, external reference e total.
