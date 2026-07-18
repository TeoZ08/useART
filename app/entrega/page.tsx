import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = { title: 'Entrega', description: 'Opções de entrega da ART.' };

export default function DeliveryPage() {
  return (
    <LegalPage eyebrow="Operação" title="Entrega">
      <section>
        <h2>Opções disponíveis</h2>
        <p>
          Retirada ART sem taxa e entrega em Campo Grande/MS por R$ 10 estão disponíveis no
          checkout.
        </p>
      </section>
      <section>
        <h2>Outras localidades</h2>
        <p>Para outras localidades, informe o endereço no checkout para consultar as opções.</p>
      </section>
    </LegalPage>
  );
}
