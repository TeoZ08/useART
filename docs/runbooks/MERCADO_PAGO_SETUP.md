# Mercado Pago

Staging permanece com `PAYMENTS_ENABLED=false`, `PAYMENT_PROVIDER=fake` e `MERCADO_PAGO_ENVIRONMENT=test`. Para ativação futura:

1. configurar token e webhook secret no ambiente correto, nunca no Git;
2. registrar `/api/webhooks/mercadopago` como notification URL;
3. validar assinatura, idempotência, valor e vínculo do pedido em test;
4. executar pagamento real controlado somente após aprovação humana;
5. trocar para `live` e habilitar pagamentos em uma mudança separada e reversível.

Execute `npm run verify:launch` antes de qualquer ativação live.
