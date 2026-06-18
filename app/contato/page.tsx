import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';
import { STORE_CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Contato oficial da ART.',
};

export default function ContactPage() {
  return (
    <LegalPage eyebrow="Atendimento" title="Contato">
      <section>
        <h2>WhatsApp</h2>
        <p>
          Atendimento oficial:{' '}
          <a href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}>
            {STORE_CONFIG.whatsappDisplay}
          </a>
          .
        </p>
      </section>
      <section>
        <h2>Instagram</h2>
        <p>
          Handle da marca: <a href={STORE_CONFIG.instagramUrl}>{STORE_CONFIG.handle}</a>.
        </p>
      </section>
      <section>
        <h2>Localização</h2>
        <p>{STORE_CONFIG.location}.</p>
      </section>
    </LegalPage>
  );
}
