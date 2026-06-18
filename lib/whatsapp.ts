import { formatItemForOrder, type AssistedOrder } from '@/domain/orders/order';
import { STORE_CONFIG } from '@/lib/config';
import { formatMoney } from '@/lib/money';

function formatOptional(value?: string): string {
  return value?.trim() ? value : '-';
}

export function buildWhatsAppMessage(order: AssistedOrder): string {
  const addressLines = order.shipping.requiresAddress
    ? [
        `CEP: ${formatOptional(order.address.cep)}`,
        `Endereço: ${formatOptional(order.address.street)}, ${formatOptional(order.address.number)}`,
        `Complemento: ${formatOptional(order.address.complement)}`,
        `Bairro: ${formatOptional(order.address.district)}`,
        `Cidade/UF: ${formatOptional(order.address.city)} - ${formatOptional(order.address.state)}`,
      ]
    : ['Retirada ART: combinar horário e local no atendimento.'];

  const shippingPrice =
    order.shippingCents === null ? 'A confirmar no atendimento' : formatMoney(order.shippingCents);
  const total = order.totalCents === null ? 'A confirmar com frete' : formatMoney(order.totalCents);
  const coupon = order.couponCode ? order.couponCode : 'Nenhum';

  return [
    `Olá! Quero preparar um pedido na ${STORE_CONFIG.brandName}.`,
    '',
    `Pedido: ${order.id}`,
    `Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}`,
    '',
    'Cliente:',
    `Nome: ${order.customer.name}`,
    `WhatsApp: ${order.customer.phone}`,
    `E-mail: ${formatOptional(order.customer.email)}`,
    '',
    'Itens:',
    ...order.items.flatMap((item, index) => [
      `${index + 1}. ${formatItemForOrder(item).join('\n')}`,
      `  - Valor unitário: ${formatMoney(item.unitPriceCents)}`,
      `  - Subtotal: ${formatMoney(item.unitPriceCents * item.quantity)}`,
      '',
    ]),
    'Entrega:',
    `${order.shipping.name}`,
    `Frete: ${shippingPrice}`,
    ...addressLines,
    '',
    'Cupom:',
    `${coupon}`,
    `Desconto: ${formatMoney(order.discountCents)}`,
    '',
    'Pagamento:',
    order.paymentNote,
    '',
    'Resumo:',
    `Subtotal produtos: ${formatMoney(order.subtotalCents)}`,
    `Frete: ${shippingPrice}`,
    `Total estimado: ${total}`,
    '',
    'Entendo que este pedido será conferido no atendimento antes do pagamento e da produção/envio.',
  ].join('\n');
}

export function buildWhatsAppUrl(order: AssistedOrder): string {
  return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    buildWhatsAppMessage(order),
  )}`;
}
