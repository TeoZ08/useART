import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Privacidade',
  description: 'Página inicial de privacidade da ART.',
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Política inicial" title="Privacidade">
      <section>
        <h2>Dados coletados</h2>
        <p>
          Na Fase 1, o checkout coleta apenas dados necessários para preparar atendimento pelo
          WhatsApp: nome, contato e, quando houver entrega, endereço.
        </p>
      </section>
      <section>
        <h2>Pendência</h2>
        <p>
          A política definitiva precisa definir retenção, base legal, operador/controlador,
          compartilhamentos e canal de solicitação do titular.
        </p>
      </section>
    </LegalPage>
  );
}
