# Cutover de Production

## Pré-condições

- PR #9 aprovado, checks verdes e relatório final revisado;
- sandbox Mercado Pago com aprovado, rejeitado/cancelado, webhook e idempotência validados;
- Supabase Production, domínio e políticas legais aprovados;
- backup e deployment anterior saudável identificados;
- autorização humana explícita para merge e ativação live.

## Ordem de lançamento

### A. Configurar base segura

Configure as variáveis obrigatórias de Production descritas em `PRODUCTION_ENV_CHECKLIST.md`, mas mantenha `STORE_MODE=staging`, `PAYMENTS_ENABLED=false` e `NATIONAL_CHECKOUT_ENABLED=false`. Configure no Supabase Auth a Site URL final e redirects do domínio live. Não altere staging nem reutilize peppers.

### B. Fazer merge do PR #9

Somente após autorização humana explícita. Use merge normal, sem force push e sem reescrever migrations.

### C. Aguardar deploy da `main`

Confirme SHA, status `Ready`, checks e ausência de erro de build. Não promova um artefato diferente do auditado.

### D. Executar smoke público

Em `https://useart.vercel.app`, valide home, hero 3D, catálogo, produto, Kit, carrinho, checkout sem pagamento, acompanhamento, login admin, MFA, mobile, reduced motion e Save-Data.

### E. Configurar Mercado Pago live

Cadastre somente credenciais live server-only em Production e `MERCADO_PAGO_ENVIRONMENT=live`. Mantenha `PAYMENTS_ENABLED=false`.

### F. Configurar webhook live

Use `https://useart.vercel.app/api/webhooks/mercadopago`, sem `x-vercel-protection-bypass`. Configure Pagamentos no painel Mercado Pago e confirme assinatura, `x-request-id`, `data.id` e consulta do pagamento na API.

### G. Ativar gate da aplicação

Defina `PAYMENT_PROVIDER=mercadopago` e `PAYMENTS_ENABLED=true`, então aguarde o redeploy Production correspondente.

### H. Ativar gate no banco

Depois do deploy saudável, altere apenas `store_settings.payments_enabled=true` e `store_settings.store_mode=live`. Não execute reset, wipe, `DROP` ou migrations reescritas.

### I. Fazer pagamento real controlado

Crie um pedido de menor valor aprovado pela operação, pague com comprador real autorizado e confirme pedido, tentativa, webhook, acompanhamento e painel. Não use cartões de teste no ambiente live.

### J. Monitorar

Durante a janela, acompanhe erros HTTP, criação de preferência, webhook, divergência de valor e atualização de pedido. Logs não podem conter token, segredo, URL completa de webhook ou token público de acompanhamento.

### K. Encerrar acessos temporários

Revogue bypasses de Preview usados no sandbox, preserve o Preview apenas pelo período necessário e mantenha Render somente como rollback legado até o encerramento da estabilização.

## Rollback

Se houver falha, primeiro defina `PAYMENTS_ENABLED=false` e desative `store_settings.payments_enabled`; depois promova o deployment saudável anterior conforme `ROLLBACK.md`. Preserve pedidos, tentativas e eventos para conciliação. Qualquer correção de banco deve ser aditiva.
