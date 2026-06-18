# Case Study — ART

## Problema

A ART precisava evoluir de um MVP estático para uma base mais sustentável de loja própria, removendo simulações inseguras e preparando o caminho para backend, pagamento e frete reais.

## Público-alvo

Clientes da loja interessados em streetwear jovem, esportivo e funcional, com compra assistida pelo WhatsApp.

## Solução

O projeto foi migrado para Next.js App Router com TypeScript, domínio separado e checkout assistido honesto. O catálogo foi reduzido às sete ofertas confirmadas e lacunas comerciais passaram a ser exibidas como pendências, não como dados inventados.

## Minha contribuição

Implementação de frontend, modelagem de domínio, carrinho, cupom transitório, frete honesto, mensagem WhatsApp, documentação de pendências e remoção do admin local inseguro.

## Stack

- React
- Next.js App Router
- TypeScript
- CSS Modules
- localStorage
- Vitest
- Playwright
- Render Static Site

## Arquitetura

Aplicação Next com UI, domínio, dados e integrações futuras separados. O carrinho permanece transitório no navegador, atrás de uma interface de repositório local. A finalização gera uma mensagem estruturada para WhatsApp sem confirmar pedido ou pagamento.

## Funcionalidades principais

- Catálogo com busca, filtros e ordenação.
- Variações por cor e tamanho.
- Kit com três configurações independentes.
- Carrinho persistente.
- Checkout assistido.
- Mensagem de pedido para WhatsApp.
- Páginas iniciais de privacidade, termos, trocas, entrega e contato.

## Decisões técnicas

- Não integrar Supabase ou Mercado Pago sem credenciais reais.
- Usar WhatsApp como canal final de conferência.
- Remover admin por variável pública.
- Não inventar frete, prazo, imagens, composição ou política definitiva.

## Desafios

- Migrar o monólito Vite para uma base modular sem perder a identidade visual aprovada.
- Tratar lacunas comerciais com placeholders e documentação.
- Manter uma experiência de compra clara sem prometer integrações inexistentes.

## Resultado atual

Base de produção da Fase 1 com catálogo oficial, carrinho local, cupom transitório, checkout assistido e documentação para Fase 2.

## Demonstração

A confirmar.

## Próximos passos

- Backend com autenticação real.
- Banco de dados para produtos e pedidos.
- Storage para imagens.
- Painel administrativo seguro.
- Regras reais de frete, pagamento, cupom e status de pedido.

## Como este projeto entra no portfólio

Projeto de cliente/MVP que demonstra entrega prática de e-commerce leve, clareza sobre limitações técnicas e foco em fluxo real de compra.
