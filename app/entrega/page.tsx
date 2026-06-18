import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Entrega',
  description: 'Condições iniciais de entrega da ART.',
};

export default function DeliveryPage() {
  return (
    <LegalPage eyebrow="Entrega inicial" title="Entrega">
      <section>
        <h2>Opções da Fase 1</h2>
        <p>
          A loja oferece retirada ART sem taxa, entrega em Campo Grande/MS por taxa fixa de R$ 10 e
          frete a confirmar para outras localidades.
        </p>
      </section>
      <section>
        <h2>Pendência</h2>
        <p>
          Prazos, transportadoras, cobertura, rastreio e regras detalhadas precisam ser definidos
          antes de integração real de frete.
        </p>
      </section>
    </LegalPage>
  );
}
