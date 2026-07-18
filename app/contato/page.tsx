import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';
import { STORE_CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Contato oficial da ART.',
};

export default function ContactPage() {
  return (
    <LegalPage eyebrow="ART / Atendimento" title="Fale com a ART">
      <section>
        <h2>WhatsApp</h2>
        <p>
          <a className="buttonPrimary" href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}>
            Abrir WhatsApp
          </a>
        </p>
      </section>
      <section>
        <h2>Instagram</h2>
        <p>
          <a href={STORE_CONFIG.instagramUrl}>{STORE_CONFIG.handle}</a>
        </p>
      </section>
      <section>
        <h2>Localização</h2>
        <p>{STORE_CONFIG.location}. Retirada ART disponível.</p>
      </section>
    </LegalPage>
  );
}
