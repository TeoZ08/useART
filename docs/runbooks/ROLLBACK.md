# Rollback

## Aplicação

1. pause alterações administrativas;
2. promova o deployment Vercel anterior conhecido como saudável;
3. confirme home, catálogo, checkout desabilitado e acompanhamento;
4. registre SHA, horário e causa.

## Banco

Migrations aplicadas são aditivas. Não execute reset remoto nem apague dados. Para regressão, publique uma migration corretiva compatível com dados existentes. Em perda/corrupção, restaure primeiro em ambiente de teste conforme `BACKUP_RESTORE.md`.

## Pagamentos

Defina `PAYMENTS_ENABLED=false` imediatamente e redeploy. O catálogo e a criação de pedidos podem continuar com o provider fake somente fora de live. Preserve webhooks e tentativas para conciliação.

O Render legado não deve ser apagado no lançamento; mantenha-o disponível até a janela de estabilização ser encerrada.
