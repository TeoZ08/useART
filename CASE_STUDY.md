# Case Study — use.a.r.t

## Problema

A use.a.r.t precisava de uma vitrine própria para apresentar camisetas, organizar o carrinho e conduzir o pedido para atendimento sem depender de uma plataforma completa de e-commerce no primeiro MVP.

## Público-alvo

Clientes da loja interessados em comprar camisetas minimalistas com seleção de cor, tamanho, entrega e pagamento combinados no atendimento.

## Solução

Foi criado um MVP estático em React/Vite com catálogo real, carrinho persistente, checkout interno e finalização pelo WhatsApp da loja.

## Minha contribuição

A confirmar no detalhe. Pelo código, o projeto inclui implementação de frontend, experiência de catálogo, carrinho, checkout, persistência local e documentação de limitações do MVP.

## Stack

- React
- Vite
- CSS
- localStorage
- Render Static Site

## Arquitetura

Aplicação frontend estática. Produtos, carrinho e pedidos recentes ficam no navegador via `localStorage`. A finalização gera uma mensagem estruturada para WhatsApp.

## Funcionalidades principais

- Catálogo com busca, filtros e ordenação.
- Variações por cor e tamanho.
- Carrinho persistente.
- Checkout por etapas.
- Mensagem de pedido para WhatsApp.
- Admin local de demonstração para manutenção do catálogo.

## Decisões técnicas

- Manter o MVP estático para reduzir custo e complexidade inicial.
- Usar WhatsApp como canal final de conferência e pagamento.
- Documentar explicitamente que o admin local não é autenticação real.

## Desafios

- Criar fluxo de compra completo sem backend.
- Evitar que a senha de demonstração fosse tratada como segredo real.
- Manter a experiência comercial sem prometer segurança inexistente.

## Resultado atual

MVP funcional de loja estática com catálogo, carrinho e checkout. A segurança administrativa segue limitada por design e precisa evoluir antes de uso em produção com dados sensíveis.

## Demonstração

A confirmar.

## Próximos passos

- Backend com autenticação real.
- Banco de dados para produtos e pedidos.
- Storage para imagens.
- Painel administrativo seguro.
- Regras reais de frete, pagamento e status de pedido.

## Como este projeto entra no portfólio

Projeto de cliente/MVP que demonstra entrega prática de e-commerce leve, clareza sobre limitações técnicas e foco em fluxo real de compra.
