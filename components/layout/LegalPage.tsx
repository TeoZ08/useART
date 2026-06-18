import type { ReactNode } from 'react';
import { STORE_CONFIG } from '@/lib/config';
import styles from './LegalPage.module.css';

interface LegalPageProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

export function LegalPage({ eyebrow, title, children }: LegalPageProps) {
  return (
    <section className={styles.page}>
      <p className="sectionEyebrow">{eyebrow}</p>
      <h1 className="sectionTitle">{title}</h1>
      <p className="sectionLead">
        Texto inicial para operação da {STORE_CONFIG.brandName}. Revisão jurídica e comercial
        obrigatória antes de publicação definitiva.
      </p>
      <div className="noticeBox">
        Esta página não substitui política formal revisada. Ela existe para não deixar lacunas na
        navegação da Fase 1.
      </div>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
