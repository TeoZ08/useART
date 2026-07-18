import type { ReactNode } from 'react';
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
      <div className={styles.content}>{children}</div>
    </section>
  );
}
