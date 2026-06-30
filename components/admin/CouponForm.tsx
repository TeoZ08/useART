import type { Tables } from '@/types/database.generated';
import { saveCoupon } from '@/app/admin/(protected)/cupons/actions';
import styles from '@/app/admin/admin.module.css';

function localDate(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 16) : '';
}

export function CouponForm({ coupon }: { coupon?: Tables<'coupons'> }) {
  return (
    <form action={saveCoupon} className={`${styles.panel} ${styles.formGrid}`}>
      {coupon ? <input type="hidden" name="id" value={coupon.id} /> : null}
      <label>
        <span>Código</span>
        <input name="code" defaultValue={coupon?.code} required />
      </label>
      <label>
        <span>Tipo</span>
        <select name="discountType" defaultValue={coupon?.discount_type ?? 'percentage'}>
          <option value="percentage">Percentual</option>
          <option value="fixed">Valor fixo em centavos</option>
        </select>
      </label>
      <label>
        <span>Valor</span>
        <input name="value" type="number" min="1" defaultValue={coupon?.value ?? 10} required />
      </label>
      <label>
        <span>Subtotal mínimo (centavos)</span>
        <input
          name="minimumSubtotalCents"
          type="number"
          min="0"
          defaultValue={coupon?.minimum_subtotal_cents ?? ''}
        />
      </label>
      <label>
        <span>Desconto máximo (centavos)</span>
        <input
          name="maximumDiscountCents"
          type="number"
          min="0"
          defaultValue={coupon?.maximum_discount_cents ?? ''}
        />
      </label>
      <label>
        <span>Limite total</span>
        <input
          name="maxRedemptions"
          type="number"
          min="1"
          defaultValue={coupon?.max_redemptions ?? ''}
        />
      </label>
      <label>
        <span>Limite por cliente</span>
        <input
          name="maxRedemptionsPerCustomer"
          type="number"
          min="1"
          defaultValue={coupon?.max_redemptions_per_customer ?? ''}
        />
      </label>
      <label>
        <span>Início</span>
        <input name="startsAt" type="datetime-local" defaultValue={localDate(coupon?.starts_at)} />
      </label>
      <label>
        <span>Fim</span>
        <input name="endsAt" type="datetime-local" defaultValue={localDate(coupon?.ends_at)} />
      </label>
      <label>
        <span>
          <input name="active" type="checkbox" defaultChecked={coupon?.active} /> Ativo
        </span>
      </label>
      <label>
        <span>
          <input name="firstOrderOnly" type="checkbox" defaultChecked={coupon?.first_order_only} />{' '}
          Somente primeira compra
        </span>
      </label>
      <label>
        <span>
          <input
            name="reviewRequired"
            type="checkbox"
            defaultChecked={coupon?.review_required ?? true}
          />{' '}
          Revisão comercial necessária
        </span>
      </label>
      <div className={styles.full}>
        <button className={styles.button} type="submit">
          {coupon ? 'Atualizar cupom' : 'Criar cupom'}
        </button>
      </div>
    </form>
  );
}
