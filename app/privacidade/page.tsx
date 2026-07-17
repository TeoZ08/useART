import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Privacidade',
  description: 'Como a ART trata dados pessoais no catálogo e nos pedidos.',
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Política em revisão" title="Privacidade">
      <section>
        <h2>Dados coletados</h2>
        <p>
          O checkout coleta nome, WhatsApp, e-mail opcional e, quando houver entrega, endereço. O
          pedido também registra itens, valores, consentimento e histórico operacional para
          atendimento, entrega e prevenção de fraude.
        </p>
      </section>
      <section>
        <h2>Compartilhamento e direitos</h2>
        <p>
          Supabase e Vercel processam os dados necessários para operar a loja. O Mercado Pago será
          usado somente quando pagamentos forem habilitados. Solicitações de acesso, correção ou
          eliminação podem ser feitas pelos canais da ART, observadas as obrigações legais de
          retenção. Esta política ainda requer revisão jurídica antes do lançamento live.
        </p>
      </section>
    </LegalPage>
  );
}
