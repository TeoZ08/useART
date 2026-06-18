import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Termos',
  description: 'Página inicial de termos de uso da ART.',
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Termos iniciais" title="Termos de uso">
      <section>
        <h2>Escopo atual</h2>
        <p>
          A vitrine prepara uma solicitação de pedido para conferência manual no WhatsApp. Ela não
          confirma pagamento, produção, envio ou reserva de estoque.
        </p>
      </section>
      <section>
        <h2>Pendência</h2>
        <p>
          Os termos finais precisam ser revisados com regras comerciais completas,
          responsabilidades, disponibilidade, atendimento e atualização de preços.
        </p>
      </section>
    </LegalPage>
  );
}
