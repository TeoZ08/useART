# Checklist de lançamento

- [ ] CI, lint, tipos, unitários, integração, segurança, E2E e build verdes
- [ ] migrations e RLS validadas em staging sem reset
- [ ] sete produtos e Kit conferidos no catálogo remoto
- [ ] retirada, Campo Grande e cotação nacional testados
- [ ] owner aceitou convite, ativou MFA e revisou permissões
- [ ] convite e recovery foram testados na origem atual e chegam a `/admin/definir-senha`
- [ ] Redirect URLs do Supabase staging não apontam para deployments antigos
- [ ] upload/ordenação/remoção segura de imagens testados
- [ ] webhook test validado e tentativa duplicada rejeitada
- [ ] APRO sandbox confirmado no banco por `provider_payment_id`, pedido `paid` e histórico webhook
- [ ] Pix visível e permitido para a conta Mercado Pago live antes de comunicar o método
- [ ] conta opcional testada com magic link; pedidos só aparecem para o e-mail autenticado correspondente
- [ ] backup e restauração testados
- [ ] smoke mobile, reduced motion e Save-Data verdes
- [ ] rollback ensaiado e deployment anterior identificado
- [ ] domínio, políticas legais e credenciais live aprovados
- [ ] aprovação humana explícita registrada

Execute `npm run verify:launch`. Uma falha bloqueia produção; não altere flags para contornar o gate.
