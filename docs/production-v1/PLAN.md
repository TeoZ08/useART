# Plano de execução — Commerce Production V1

## Sequência

1. Migrar a branch para Next.js dinâmico em Node 22, com env validado por Zod, clientes Supabase SSR e proteção de admin.
2. Criar schema, migrations, RLS, funções transacionais, Storage e seed idempotente do catálogo.
3. Implementar repositories Supabase e contratos de domínio sem acoplar UI ao banco.
4. Tornar preço, cupom, frete, reserva de estoque e criação do pedido exclusivamente server-side.
5. Implementar provider de pagamento, adapter oficial Mercado Pago e fake limitado a testes/non-live.
6. Criar retorno/status público por token opaco e webhook autenticado, idempotente e auditável.
7. Criar Auth e painel admin para catálogo, variantes, imagens, pedidos, cupons e configurações.
8. Migrar páginas públicas sem regressão visual e preservar a hero 3D.
9. Implementar segurança, privacidade, CI, runbooks e verificações de lançamento.
10. Validar Nível A, publicar branch, abrir Draft PR e tentar Nível B sem fazer cutover prematuro.

## Verificações mínimas

`npm ci`, format, lint, TypeScript, unitários, banco/RLS, integração, build, Playwright, auditoria de dependências e verificação de secrets.

## Estratégia de entrega

- commits pequenos e temáticos;
- migrations imutáveis depois de aplicadas remotamente;
- flags seguras por padrão (`PAYMENTS_ENABLED=false` e checkout nacional desativado);
- Preview antes de merge;
- Render permanece legado até cutover explícito;
- nenhuma alegação de produção comercial sem todos os critérios do Nível C.
