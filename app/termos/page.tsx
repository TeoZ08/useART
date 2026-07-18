import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = { title: 'Termos', description: 'Condições de uso da ART.' };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Condições de uso" title="Termos de uso">
      <section>
        <h2>Pedidos</h2>
        <p>
          O checkout cria um pedido com preços, desconto, estoque e frete recalculados pelo
          servidor. Pedidos nacionais permanecem em cotação até a ART informar o frete. Um pedido
          criado não representa pagamento aprovado, produção iniciada ou envio confirmado.
        </p>
      </section>
      <section>
        <h2>Disponibilidade</h2>
        <p>
          Estoque, prazo e disponibilidade são confirmados durante a operação do pedido. Erros
          materiais podem ser corrigidos antes do pagamento, com comunicação ao cliente.
        </p>
      </section>
    </LegalPage>
  );
}
