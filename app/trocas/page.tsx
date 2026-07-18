import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Trocas',
  description: 'Atendimento para trocas da ART.',
};

export default function ExchangesPage() {
  return (
    <LegalPage eyebrow="Atendimento" title="Trocas">
      <section>
        <h2>Como solicitar</h2>
        <p>
          Para solicitar uma troca ou tirar dúvidas sobre um pedido, fale com a ART pelo canal de
          atendimento informado na página de contato.
        </p>
      </section>
    </LegalPage>
  );
}
