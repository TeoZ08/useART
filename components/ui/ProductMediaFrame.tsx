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
  return (
    <div
      className={`${compact ? styles.compactFrame : styles.frame} ${
        media.cutoutStatus === 'available' ? styles.cutoutFrame : styles.studioFrame
      }`}
    >
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
          sizes={compact ? '(max-width: 680px) 100vw, 33vw' : '(max-width: 920px) 100vw, 56vw'}
        />
      ) : (
        <div className={styles.placeholder} role="img" aria-label={media.alt}>
          <b>ART</b>
          <span>{productName}</span>
        </div>
      )}
    </div>
  );
}
