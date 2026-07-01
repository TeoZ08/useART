import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveStoreSettings } from './actions';
import styles from '../../admin.module.css';

export default async function SettingsPage() {
  await requireAdmin(['owner', 'admin']);
  const db = createAdminClient();
  const { data, error } = await db
    .from('store_settings')
    .select('*')
    .eq('singleton', true)
    .single();
  if (error) throw new Error(`Falha ao carregar configurações: ${error.message}`);
  return (
    <>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Operação</p>
        <h1>Configurações</h1>
        <p>
          Flags do ambiente prevalecem sobre o banco. Habilitar pagamento ou live exige confirmação
          adicional.
        </p>
      </header>
      <form action={saveStoreSettings} className={`${styles.panel} ${styles.formGrid}`}>
        <label>
          <span>Modo da loja</span>
          <select name="storeMode" defaultValue={data.store_mode}>
            <option value="staging">Staging</option>
            <option value="paused">Pausada</option>
            <option value="live">Live — bloqueado por gates</option>
          </select>
        </label>
        <label>
          <span>WhatsApp</span>
          <input
            name="whatsappNumber"
            inputMode="numeric"
            defaultValue={data.whatsapp_number}
            required
          />
        </label>
        <label>
          <span>Cidade local</span>
          <input name="localDeliveryCity" defaultValue={data.local_delivery_city} required />
        </label>
        <label>
          <span>UF local</span>
          <input
            name="localDeliveryState"
            maxLength={2}
            defaultValue={data.local_delivery_state}
            required
          />
        </label>
        <label>
          <span>Taxa local (centavos)</span>
          <input
            name="localDeliveryFeeCents"
            type="number"
            min="0"
            defaultValue={data.local_delivery_fee_cents}
            required
          />
        </label>
        <label>
          <span>Prazo padrão (dias úteis)</span>
          <input
            name="defaultLeadTimeDays"
            type="number"
            min="0"
            defaultValue={data.default_lead_time_days}
            required
          />
        </label>
        <label>
          <span>E-mail de suporte</span>
          <input name="supportEmail" type="email" defaultValue={data.support_email ?? ''} />
        </label>
        <label>
          <span>
            <input name="pickupEnabled" type="checkbox" defaultChecked={data.pickup_enabled} />{' '}
            Retirada habilitada
          </span>
        </label>
        <label>
          <span>
            <input
              name="localDeliveryEnabled"
              type="checkbox"
              defaultChecked={data.local_delivery_enabled}
            />{' '}
            Entrega local habilitada
          </span>
        </label>
        <label>
          <span>
            <input
              name="nationalQuoteEnabled"
              type="checkbox"
              defaultChecked={data.national_quote_enabled}
            />{' '}
            Cotação nacional habilitada
          </span>
        </label>
        <label>
          <span>
            <input name="paymentsEnabled" type="checkbox" defaultChecked={data.payments_enabled} />{' '}
            Pagamentos habilitados
          </span>
        </label>
        <label className={styles.full}>
          <span>Confirmação para live/pagamentos</span>
          <input name="confirmation" placeholder="Digite CONFIRMAR somente para mudança crítica" />
        </label>
        <div className={styles.full}>
          <button className={styles.button}>Salvar configurações</button>
        </div>
      </form>
    </>
  );
}
