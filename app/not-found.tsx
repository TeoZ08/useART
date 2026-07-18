import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="pageSection">
      <p className="sectionEyebrow">404</p>
      <h1 className="sectionTitle">Página não encontrada</h1>
      <p className="sectionLead">O caminho que você procurou não está disponível.</p>
      <Link className="buttonPrimary" href="/">
        Voltar para a ART
      </Link>
    </section>
  );
}
