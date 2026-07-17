import { z } from 'zod';

const size = z.enum(['PP', 'P', 'M', 'G', 'GG', 'XG']);
const colorId = z.enum(['branco-off-white', 'preto', 'marrom', 'a-confirmar']);
const applicationId = z.enum(['logo-lateral', 'logo-central', 'assinatura-lateral']);

const simpleSelection = z.object({
  type: z.literal('simple'),
  colorId,
  size,
});

const kitPiece = z.object({
  pieceNumber: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  applicationId,
  colorId,
  size,
});

const kitSelection = z.object({
  type: z.literal('kit'),
  pieces: z.tuple([kitPiece, kitPiece, kitPiece]).superRefine((pieces, context) => {
    const positions = new Set(pieces.map((piece) => piece.pieceNumber));
    if (positions.size !== 3)
      context.addIssue({ code: 'custom', message: 'Peças do kit devem ser 1, 2 e 3.' });
  }),
});

const address = z.object({
  postalCode: z.string().trim().min(8).max(10),
  street: z.string().trim().min(2).max(160),
  number: z.string().trim().min(1).max(30),
  complement: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  state: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase()),
});

export const checkoutInputSchema = z
  .object({
    customer: z.object({
      name: z.string().trim().min(2).max(160),
      phone: z.string().trim().min(10).max(24),
      email: z.union([z.email(), z.literal('')]).optional(),
    }),
    shipping: z.discriminatedUnion('method', [
      z.object({ method: z.literal('pickup') }),
      z.object({ method: z.literal('local_delivery'), address }),
      z.object({ method: z.literal('national_quote'), address }),
    ]),
    couponCode: z.string().trim().max(64).optional(),
    notes: z.string().trim().max(2000).optional(),
    privacyTermsVersion: z.string().trim().min(1).max(80),
    privacyAccepted: z.literal(true),
    items: z
      .array(
        z.object({
          variantId: z.uuid(),
          quantity: z.number().int().min(1).max(20),
          selection: z.discriminatedUnion('type', [simpleSelection, kitSelection]),
          imageSnapshot: z.string().max(500).optional(),
        }),
      )
      .min(1)
      .max(50),
  })
  .strict();

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
