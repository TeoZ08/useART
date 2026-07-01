# Checklist de lançamento

- [ ] CI, lint, tipos, unitários, integração, segurança, E2E e build verdes
- [ ] migrations e RLS validadas em staging sem reset
- [ ] sete produtos e Kit conferidos no catálogo remoto
- [ ] retirada, Campo Grande e cotação nacional testados
- [ ] owner aceitou convite, ativou MFA e revisou permissões
- [ ] upload/ordenação/remoção segura de imagens testados
- [ ] webhook test validado e tentativa duplicada rejeitada
- [ ] backup e restauração testados
- [ ] smoke mobile, reduced motion e Save-Data verdes
- [ ] rollback ensaiado e deployment anterior identificado
- [ ] domínio, políticas legais e credenciais live aprovados
- [ ] aprovação humana explícita registrada

Execute `npm run verify:launch`. Uma falha bloqueia produção; não altere flags para contornar o gate.
