# Decisões de produto

## Marca

- Nome principal: ART.
- Handle: `@use.a.r.t`.
- Slogan: Conforto em movimento.
- Direção: streetwear jovem, esportivo, funcional, preto e branco.
- Logo atual tratada como provisória e centralizada em `lib/config.ts`.

## Contato

- WhatsApp exibido: `+55 67 99169-1441`.
- Link `wa.me`: `5567991691441`.
- O número fica centralizado em `STORE_CONFIG`.

## Catálogo

O catálogo oficial da Fase 1 tem exatamente sete ofertas:

1. Moletom ART — R$ 109,90.
2. Camiseta Híbrida — logo lateral — R$ 45,00.
3. Camiseta Híbrida — logo central — R$ 45,00.
4. Camiseta Híbrida — assinatura lateral — R$ 45,00.
5. Kit Seleção — 3 camisetas — R$ 114,90.
6. Camiseta Solid Masculina — logo central — R$ 50,00.
7. Camiseta Solid Masculina — assinatura lateral — R$ 50,00.

## Imagens

- Produto sem imagem confirmada usa `imageStatus: pending` no domínio e placeholder visual.
- Produto com imagem parcial usa `imageStatus: partial`.
- Não foram usadas imagens de outro SKU para Moletom, Kit, Solid logo central ou Híbrida assinatura lateral.

## Kit Seleção

- Cada uma das três peças possui aplicação, cor e tamanho independentes.
- O carrinho e a mensagem WhatsApp exibem as três configurações separadas.

## Cupom

- Código: `PRIMEIRACOMPRA`.
- Desconto: 10%.
- Regra atual é transitória e testável em `domain/coupon`.
- Validação server-side é obrigatória na Fase 2.
- Não foram inventadas restrições de mínimo, validade, elegibilidade, uso único ou acumulação.

## Entrega

- Retirada ART: R$ 0.
- Campo Grande/MS: R$ 10.
- Outras localidades: frete a confirmar no atendimento.
- A interface `ShippingQuoteProvider` foi criada sem simular API externa.

## Pagamento

- Nesta fase, o pagamento é combinado no atendimento.
- Pix manual pode ser informado pela loja, sem declarar integração.
- Mercado Pago Checkout Pro fica documentado como gateway futuro.
- Cartão, boleto e bandeiras foram removidos da vitrine.

## Admin

- Admin local removido.
- Painel futuro depende de Supabase Auth, Postgres e Storage, documentado sem implementação fictícia.
