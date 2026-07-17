const orderStatusLabels: Record<string, string> = {
  draft: 'Rascunho',
  quote_requested: 'Frete em cotação',
  awaiting_payment: 'Aguardando pagamento',
  payment_pending: 'Pagamento em análise',
  paid: 'Pago',
  in_production: 'Em produção',
  ready_for_pickup: 'Pronto para retirada',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

const paymentStatusLabels: Record<string, string> = {
  not_created: 'Pagamento não iniciado',
  pending: 'Em análise',
  approved: 'Aprovado',
  rejected: 'Recusado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  charged_back: 'Contestação recebida',
};

const shippingMethodLabels: Record<string, string> = {
  pickup: 'Retirada',
  local_delivery: 'Entrega local',
  national_quote: 'Entrega nacional a cotar',
};

export function orderStatusLabel(status: string): string {
  return orderStatusLabels[status] ?? status;
}

export function paymentStatusLabel(status: string): string {
  return paymentStatusLabels[status] ?? status;
}

export function shippingMethodLabel(method: string): string {
  return shippingMethodLabels[method] ?? method;
}
