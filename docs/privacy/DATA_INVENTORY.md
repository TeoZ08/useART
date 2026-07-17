# Inventário de dados

Pedidos armazenam nome, telefone, e-mail opcional, endereço quando necessário, consentimento, itens, valores e estados operacionais. O sistema também armazena hashes para rate limit/idempotência, tokens opacos de acompanhamento, eventos de pagamento e auditoria administrativa.

Supabase hospeda banco, Auth e imagens públicas de produto; Vercel executa a aplicação; Mercado Pago será operador de pagamentos quando habilitado. Segredos são server-only. Logs não devem conter tokens, telefone, e-mail, endereço ou payload integral de webhook.
