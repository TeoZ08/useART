'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
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
  ProductSize,
} from '@/types/commerce';
import styles from './ProductPurchasePanel.module.css';

interface ProductPurchasePanelProps {
  product: CatalogProduct;
}

interface KitPieceState {
  applicationId: ProductApplicationId;
  colorId: ProductColorId;
  size: ProductSize;
}

const pieceNumbers = [1, 2, 3] as const;

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const firstColor = product.colors[0];
  const firstSize = product.sizes[0];
  const [colorId, setColorId] = useState<ProductColorId>(firstColor.id);
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

  const canAdd = useMemo(
    () => product.kind === 'kit' || Boolean(colorId && size),
    [colorId, product.kind, size],
  );

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
        : createSimpleSelection(colorId, size);

    const current = localCartRepository.read();
    const item = createCartItem(product, selection, quantity);
    localCartRepository.write(addCartItem(current, item));
    setMessage('Produto adicionado ao carrinho.');
  }

  return (
    <div className={styles.panel} data-testid="purchase-panel">
      {product.kind === 'kit' ? (
        <div className={styles.kitGrid}>
          {pieceNumbers.map((pieceNumber, index) => (
            <fieldset className={styles.kitPiece} key={pieceNumber}>
              <legend>Peça {pieceNumber}</legend>
              <label>
                <span>Aplicação</span>
                <select
                  value={kitPieces[index].applicationId}
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
                  value={kitPieces[index].colorId}
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
                  value={kitPieces[index].size}
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
          ))}
        </div>
      ) : (
        <>
          <div className={styles.optionBlock}>
            <p>Cor</p>
            <div className={styles.swatches}>
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  className={colorId === color.id ? styles.selectedSwatch : ''}
                  style={{ background: color.hex }}
                  title={color.name}
                  aria-label={`Selecionar cor ${color.name}`}
                  onClick={() => setColorId(color.id)}
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
          <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
            -
          </button>
          <span>{quantity}</span>
          <button type="button" onClick={() => setQuantity((current) => current + 1)}>
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
