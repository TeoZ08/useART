import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Trocas',
  description: 'Página inicial de trocas e devoluções da ART.',
};

export default function ExchangesPage() {
  return (
    <LegalPage eyebrow="Política inicial" title="Trocas">
      <section>
        <h2>Atendimento</h2>
        <p>
          Situações de troca ou ajuste devem ser tratadas pelo WhatsApp enquanto a política formal
          não estiver aprovada.
        </p>
      </section>
      <section>
        <h2>Pendência</h2>
        <p>
          A política definitiva precisa confirmar prazos, condições de produto, custos de envio,
          exceções e fluxo de solicitação.
        </p>
      </section>
    </LegalPage>
  );
}
