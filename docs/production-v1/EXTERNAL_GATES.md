# Gates externos

Estado em 30 de junho de 2026.

## Nível A

- **Docker/DB local:** daemon indisponível nesta sessão. Bloqueia `supabase start`, reset e prova local completa de RLS, mas não bloqueia código, migrations, unitários ou build.
- **Chave publicável Supabase:** ausente no `.env.local`. O app deve falhar de forma legível quando uma rota que exige Supabase for usada sem a chave.

## Nível B

- **Supabase dev:** projeto vinculado e CLI autenticada; migrations ainda não aplicadas.
- **Vercel Preview:** projeto existe, mas está configurado como `services`/Node 24 e sem deployment. Precisa ser alinhado a Next.js/Node 22.
- **Admin real:** requer convite/provisionamento do e-mail bootstrap após schema e Auth estarem prontos.
- **Mercado Pago test:** access token e webhook secret estão vazios. Não criar credenciais fictícias e não habilitar pagamentos.
- **Webhook público:** depende de Preview HTTPS e credenciais de teste do Mercado Pago.

## Nível C

Exige decisão/ação humana e não será ativado autonomamente:

- credenciais live do Mercado Pago e pagamento real controlado;
- domínio e DNS;
- MFA efetivamente habilitado e confirmado para administradores;
- revisão jurídica de privacidade, termos, entrega e trocas;
- confirmação comercial do cupom;
- política de backup e restauração testada;
- aprovação explícita do proprietário para cutover.

## Regra de status

Gates externos permanecem abertos e visíveis. Código concluído não transforma automaticamente staging em produção comercial.
