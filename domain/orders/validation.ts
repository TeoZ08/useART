import type { AddressData, CustomerData } from '@/domain/orders/order';
import type { ShippingQuote } from '@/domain/shipping/shipping';

export type ValidationErrors = Record<string, string>;

export function validateCustomer(customer: CustomerData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!customer.name.trim()) {
    errors.name = 'Informe seu nome.';
  }

  if (!customer.phone.trim()) {
    errors.phone = 'Informe seu WhatsApp.';
  }

  return errors;
}

export function validateAddress(address: AddressData, shipping: ShippingQuote): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!shipping.requiresAddress) return errors;

  if (!address.cep?.trim()) errors.cep = 'Informe o CEP.';
  if (!address.street?.trim()) errors.street = 'Informe a rua.';
  if (!address.number?.trim()) errors.number = 'Informe o número.';
  if (!address.district?.trim()) errors.district = 'Informe o bairro.';
  if (!address.city?.trim()) errors.city = 'Informe a cidade.';
  if (!address.state?.trim()) errors.state = 'Informe o estado.';

  return errors;
}
