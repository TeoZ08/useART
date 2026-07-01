import type { Metadata } from 'next';
import { LegalPage } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Termos',
  description: 'Condições de uso e criação de pedidos na ART.',
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Termos em revisão" title="Termos de uso">
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
          materiais podem ser corrigidos antes do pagamento, com comunicação ao cliente. Estes
          termos ainda requerem revisão comercial e jurídica antes do lançamento live.
        </p>
      </section>
    </LegalPage>
  );
}
