# Mercado Pago

O Preview de staging usa credenciais de teste e, durante a validação controlada, pode usar:

- `MERCADO_PAGO_ENVIRONMENT=test`;
- `PAYMENT_PROVIDER=mercadopago`;
- `PAYMENTS_ENABLED=true` somente depois de o gate `store_settings.payments_enabled` ter sido revisado no painel admin.

## Cartão, saldo e Pix

Checkout Pro não exclui cartão, saldo em conta ou Pix na preferência da ART. A disponibilidade final
é decidida pelo Mercado Pago conforme a conta vendedora, o país e o comprador. Antes de comunicar
Pix publicamente em live, confirme no painel Mercado Pago que Pix está habilitado para a conta.

No sandbox, entre com a conta **Comprador de teste**, abra uma preferência e selecione Pix quando o
método aparecer. Pix pode permanecer pendente até a liquidação simulada; a confirmação válida é o
status consultado pelo provider e aplicado ao pedido, não apenas a tela do checkout.

## Notification URL em Preview protegido

Configure `MERCADO_PAGO_WEBHOOK_URL` somente no ambiente **Preview** da Vercel com a URL absoluta já cadastrada no painel do Mercado Pago. Em Preview protegido, ela deve incluir o query parameter `x-vercel-protection-bypass` completo.

Trate o valor inteiro como segredo: não copie para `.env.example`, logs, erros, screenshots, tickets ou comentários do PR. A aplicação preserva a string configurada sem reconstruir ou remover query parameters. Quando a variável estiver ausente, o fallback continua sendo `/api/webhooks/mercadopago` no domínio da aplicação.

Depois de adicionar ou alterar a variável, gere um novo Preview para que a configuração seja aplicada. Não configure esse valor em Production durante a validação de sandbox.

## Gates para ativação futura

1. manter token, webhook secret e webhook URL somente no ambiente correto, nunca no Git;
2. validar assinatura, idempotência, valor e vínculo do pedido em `test`;
3. executar pagamento de sandbox controlado somente após aprovação humana;
4. habilitar pagamentos em uma mudança separada e reversível;
5. trocar para `live` somente em uma etapa posterior, com credenciais e URL próprias de Production.

## Confirmação do pagamento

O webhook assinado é a fonte principal de confirmação. O retorno do Checkout Pro também aciona uma
reconciliação limitada: o servidor consulta o pagamento no Mercado Pago e só atualiza o pedido se
`external_reference` e valor corresponderem. Isso melhora a experiência quando a entrega do webhook
atrasa; não substitui HMAC, `x-request-id` e `data.id` no webhook.

Execute `npm run verify:launch` antes de qualquer ativação live.
