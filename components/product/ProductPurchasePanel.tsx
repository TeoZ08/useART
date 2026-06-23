'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductMediaFrame } from '@/components/ui/ProductMediaFrame';
import { addCartItem, createCartItem } from '@/domain/cart/cart';
import { localCartRepository } from '@/domain/cart/cartRepository';
import {
  createKitPieceSelection,
  createKitSelection,
  createSimpleSelection,
} from '@/domain/cart/selection';
import { KIT_APPLICATIONS } from '@/domain/products/catalog';
import type {
  CatalogProduct,
  ProductApplicationId,
  ProductColorId,
  ProductMedia,
  ProductSize,
} from '@/types/commerce';
import styles from './ProductPurchasePanel.module.css';

interface ProductPurchasePanelProps {
  product: CatalogProduct;
  selectedColorId?: ProductColorId;
  onColorChange?: (colorId: ProductColorId) => void;
}

interface KitPieceState {
  applicationId: ProductApplicationId;
  colorId: ProductColorId;
  size: ProductSize;
}

const pieceNumbers = [1, 2, 3] as const;

const kitApplicationFolders = {
  'logo-lateral': 'hybrid-logo-lateral',
  'logo-central': 'hybrid-logo-central',
  'assinatura-lateral': 'hybrid-assinatura',
} as const;

const kitColorFiles = {
  'branco-off-white': 'branco',
  preto: 'preto',
  marrom: 'marrom',
  'a-confirmar': 'branco',
} as const;

function mediaForKitPiece(
  applicationId: ProductApplicationId,
  colorId: ProductColorId,
  colorName: string,
): ProductMedia {
  const folder = kitApplicationFolders[applicationId];
  const color = kitColorFiles[colorId];
  const cutoutAvailable = colorId === 'preto' || colorId === 'marrom';

  return {
    status: 'available',
    src: cutoutAvailable
      ? `/assets/products/cutouts/${folder}-${color}.png`
      : `/assets/products/${folder}/${color}.png`,
    alt: `Camiseta Híbrida ART ${colorName}, ${applicationId.replace('-', ' ')}`,
    cutoutStatus: cutoutAvailable ? 'available' : 'needs-review',
  };
}

export function ProductPurchasePanel({
  product,
  selectedColorId,
  onColorChange,
}: ProductPurchasePanelProps) {
  const firstColor = product.colors[0];
  const firstSize = product.sizes[0];
  const [localColorId, setLocalColorId] = useState<ProductColorId>(firstColor.id);
  const [size, setSize] = useState<ProductSize>(firstSize);
  const [quantity, setQuantity] = useState(1);
  const [kitPieces, setKitPieces] = useState<KitPieceState[]>(() =>
    pieceNumbers.map((pieceNumber) => ({
      applicationId: KIT_APPLICATIONS[pieceNumber - 1]?.id ?? 'logo-lateral',
      colorId: firstColor.id,
      size: firstSize,
    })),
  );
  const [message, setMessage] = useState('');

  const colorOptions = product.colors;
  const applicationOptions = product.applications ?? KIT_APPLICATIONS;
  const activeColorId = selectedColorId ?? localColorId;

  const canAdd = useMemo(
    () => product.kind === 'kit' || Boolean(activeColorId && size),
    [activeColorId, product.kind, size],
  );

  function chooseColor(nextColorId: ProductColorId) {
    setLocalColorId(nextColorId);
    onColorChange?.(nextColorId);
  }

  function updateKitPiece(index: number, patch: Partial<KitPieceState>) {
    setKitPieces((current) =>
      current.map((piece, pieceIndex) => (pieceIndex === index ? { ...piece, ...patch } : piece)),
    );
  }

  function addToCart() {
    if (!canAdd) {
      setMessage('Selecione as opções antes de adicionar ao carrinho.');
      return;
    }

    const selection =
      product.kind === 'kit'
        ? createKitSelection(
            kitPieces.map((piece, index) =>
              createKitPieceSelection(
                pieceNumbers[index],
                piece.applicationId,
                piece.colorId,
                piece.size,
              ),
            ),
          )
        : createSimpleSelection(activeColorId, size);

    const current = localCartRepository.read();
    const item = createCartItem(product, selection, quantity);
    localCartRepository.write(addCartItem(current, item));
    setMessage('Produto adicionado ao carrinho.');
  }

  return (
    <div className={styles.panel} data-testid="purchase-panel">
      {product.kind === 'kit' ? (
        <>
          <div className={styles.kitIntro}>
            <span>03 peças</span>
            <p>Cada camiseta é configurada de forma independente.</p>
          </div>
          <div className={styles.kitGrid}>
            {pieceNumbers.map((pieceNumber, index) => {
              const piece = kitPieces[index];
              const application = applicationOptions.find(
                (item) => item.id === piece.applicationId,
              );
              const color = colorOptions.find((item) => item.id === piece.colorId);

              return (
                <fieldset className={styles.kitPiece} key={pieceNumber}>
                  <legend>Peça {pieceNumber}</legend>
                  <div className={styles.kitPieceHeader}>
                    <span>0{pieceNumber}</span>
                    <p>{application?.name ?? 'Aplicação a confirmar'}</p>
                  </div>
                  <div className={styles.kitPreview}>
                    <ProductMediaFrame
                      media={mediaForKitPiece(
                        piece.applicationId,
                        piece.colorId,
                        color?.name ?? 'a confirmar',
                      )}
                      productName={`Peça ${pieceNumber}`}
                      compact
                    />
                  </div>
                  <label>
                    <span>Aplicação</span>
                    <select
                      value={piece.applicationId}
                      onChange={(event) =>
                        updateKitPiece(index, {
                          applicationId: event.target.value as ProductApplicationId,
                        })
                      }
                    >
                      {applicationOptions.map((application) => (
                        <option key={application.id} value={application.id}>
                          {application.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Cor</span>
                    <select
                      value={piece.colorId}
                      onChange={(event) =>
                        updateKitPiece(index, { colorId: event.target.value as ProductColorId })
                      }
                    >
                      {colorOptions.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Tamanho</span>
                    <select
                      value={piece.size}
                      onChange={(event) =>
                        updateKitPiece(index, { size: event.target.value as ProductSize })
                      }
                    >
                      {product.sizes.map((productSize) => (
                        <option key={productSize} value={productSize}>
                          {productSize}
                        </option>
                      ))}
                    </select>
                  </label>
                </fieldset>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className={styles.optionBlock}>
            <p>Cor</p>
            <div className={styles.swatches}>
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  className={activeColorId === color.id ? styles.selectedSwatch : ''}
                  style={{ background: color.hex }}
                  title={color.name}
                  aria-label={`Selecionar cor ${color.name}`}
                  aria-pressed={activeColorId === color.id}
                  onClick={() => chooseColor(color.id)}
                />
              ))}
            </div>
          </div>
          <div className={styles.optionBlock}>
            <p>Tamanho</p>
            <div className={styles.sizeGrid}>
              {product.sizes.map((productSize) => (
                <button
                  key={productSize}
                  type="button"
                  className={size === productSize ? styles.selectedSize : ''}
                  onClick={() => setSize(productSize)}
                  aria-pressed={size === productSize}
                >
                  {productSize}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className={styles.quantity}>
        <p>Quantidade</p>
        <div>
          <button
            type="button"
            aria-label="Diminuir quantidade"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            onClick={() => setQuantity((current) => current + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className="buttonPrimary"
          type="button"
          onClick={addToCart}
          data-testid="add-to-cart"
        >
          Adicionar ao carrinho
        </button>
        <Link className="buttonSecondary" href="/carrinho">
          Ver carrinho
        </Link>
      </div>
      {message && <p className={styles.message}>{message}</p>}
      <p className={styles.note}>
        A seleção registra intenção de compra. Disponibilidade, pagamento e produção serão
        conferidos no atendimento.
      </p>
    </div>
  );
}
