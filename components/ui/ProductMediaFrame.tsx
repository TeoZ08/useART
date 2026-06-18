import Image from 'next/image';
import type { ProductMedia } from '@/types/commerce';
import styles from './ProductMediaFrame.module.css';

interface ProductMediaFrameProps {
  media: ProductMedia;
  productName: string;
  priority?: boolean;
  compact?: boolean;
}

export function ProductMediaFrame({
  media,
  productName,
  priority = false,
  compact = false,
}: ProductMediaFrameProps) {
  const statusLabel =
    media.status === 'pending'
      ? 'Imagem pendente'
      : media.status === 'partial'
        ? 'Imagem parcial'
        : null;

  return (
    <div className={compact ? styles.compactFrame : styles.frame}>
      <span className={styles.watermark} aria-hidden="true">
        ART
      </span>
      {media.src ? (
        <Image
          src={media.src}
          alt={media.alt}
          width={760}
          height={820}
          className={styles.image}
          priority={priority}
        />
      ) : (
        <div className={styles.placeholder} role="img" aria-label={media.alt}>
          <b>ART</b>
          <span>{productName}</span>
        </div>
      )}
      {statusLabel && (
        <span className={styles.badge} title={media.pendingReason}>
          {statusLabel}
        </span>
      )}
    </div>
  );
}
