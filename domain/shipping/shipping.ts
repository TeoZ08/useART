export type ShippingMethodId = 'retirada-art' | 'campo-grande-ms' | 'outra-localidade';

export interface ShippingInput {
  methodId: ShippingMethodId;
  city?: string;
  state?: string;
}

export interface ShippingQuote {
  id: ShippingMethodId;
  name: string;
  detail: string;
  priceCents: number | null;
  requiresAddress: boolean;
  requiresManualConfirmation: boolean;
}

export interface ShippingQuoteProvider {
  quote(input: ShippingInput): ShippingQuote;
  list(): ShippingQuote[];
}

export const SHIPPING_QUOTES: ShippingQuote[] = [
  {
    id: 'retirada-art',
    name: 'Retirada ART',
    detail: 'R$ 0. Horário e local combinados pelo atendimento.',
    priceCents: 0,
    requiresAddress: false,
    requiresManualConfirmation: false,
  },
  {
    id: 'campo-grande-ms',
    name: 'Entrega em Campo Grande/MS',
    detail: 'Taxa fixa de entrega local.',
    priceCents: 1000,
    requiresAddress: true,
    requiresManualConfirmation: false,
  },
  {
    id: 'outra-localidade',
    name: 'Outra localidade',
    detail: 'Frete a calcular e confirmar no atendimento.',
    priceCents: null,
    requiresAddress: true,
    requiresManualConfirmation: true,
  },
];

export class StaticShippingQuoteProvider implements ShippingQuoteProvider {
  quote(input: ShippingInput): ShippingQuote {
    return SHIPPING_QUOTES.find((quote) => quote.id === input.methodId) ?? SHIPPING_QUOTES[2];
  }

  list(): ShippingQuote[] {
    return [...SHIPPING_QUOTES];
  }
}

export const shippingQuoteProvider = new StaticShippingQuoteProvider();
