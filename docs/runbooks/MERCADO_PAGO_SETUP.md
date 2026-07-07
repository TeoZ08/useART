# Mercado Pago

O Preview de staging usa credenciais de teste e deve permanecer com:

- `MERCADO_PAGO_ENVIRONMENT=test`;
- `PAYMENT_PROVIDER=mercadopago`;
- `PAYMENTS_ENABLED=false`.

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

Execute `npm run verify:launch` antes de qualquer ativação live.
