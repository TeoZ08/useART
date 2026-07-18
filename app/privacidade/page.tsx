import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = { title: 'Privacidade', description: 'Dados pessoais na ART.' };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Dados pessoais" title="Privacidade">
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
          Solicitações relacionadas aos seus dados podem ser feitas pelos canais oficiais da ART. Os
          dados são usados para atender pedidos, entrega e segurança da operação.
        </p>
      </section>
    </LegalPage>
  );
}
