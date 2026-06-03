import { memo } from 'react';
import type { FlashSaleProduct } from '../types';
import { formatRupiah, progressPercent } from '../utils/format';

interface FlashSaleProductCardProps {
  product: FlashSaleProduct;
  variant: 'active' | 'upcoming';
  onBuy?: (flashSaleProductId: string) => void;
  buying?: boolean;
}

function makePlaceholder(name: string): string {
  const initial = (name.trim().charAt(0) || '?').toUpperCase();
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#e5f7e7"/>
            <stop offset="100%" stop-color="#c5ecc8"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#g)"/>
        <text x="50%" y="55%" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="92"
              font-weight="800" fill="#03ac0e">${initial}</text>
      </svg>`
    )
  );
}

function FlashSaleProductCard({
  product,
  variant,
  onBuy,
  buying = false,
}: FlashSaleProductCardProps) {
  const name = product.product_name || `Flash Sale #${product.id}`;
  const stock = product.stock ?? 0;
  const cachedStock = product.cached_stock ?? stock;
  const stockPct = cachedStock > 0 ? progressPercent(stock, cachedStock) : 0;
  const isSoldOut = stock <= 0;
  const imageUrl = makePlaceholder(name);

  return (
    <article
      className={`product-card ${variant === 'upcoming' ? 'is-upcoming' : ''}`}
    >
      <div className="product-card-thumb">
        <img src={imageUrl} alt={name} loading="lazy" />
        {variant === 'active' && !isSoldOut && (
          <span className="product-card-badge">FLASH SALE</span>
        )}
        {variant === 'active' && isSoldOut && (
          <span className="product-card-badge product-card-badge-sold">
            SOLD OUT
          </span>
        )}
        {variant === 'upcoming' && (
          <span className="product-card-badge product-card-badge-soon">
            Coming soon
          </span>
        )}
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title" title={name}>
          {name}
        </h3>

        <div className="product-card-price-row">
          <span className="product-card-price">
            {formatRupiah(product.price)}
          </span>
        </div>

        {variant === 'active' ? (
          <>
            <div className="product-card-stock">
              <div className="product-card-stock-bar">
                <div
                  className={`product-card-stock-fill ${
                    stockPct < 30 ? 'is-low' : ''
                  }`}
                  style={{ width: `${isSoldOut ? 0 : Math.max(stockPct, 8)}%` }}
                />
              </div>
              <span className="product-card-stock-text">
                {isSoldOut
                  ? 'Out of stock'
                  : stock <= 5
                    ? `Only ${stock} left!`
                    : `${stock} in stock`}
              </span>
            </div>
            {onBuy && (
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => onBuy(product.id)}
                disabled={buying || isSoldOut}
              >
                {buying ? 'Processing…' : isSoldOut ? 'Sold Out' : 'Buy Now'}
              </button>
            )}
          </>
        ) : (
          <div className="product-card-stock-text">
            {stock > 0 ? `${stock} units available` : 'Stock pending'}
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(FlashSaleProductCard);
