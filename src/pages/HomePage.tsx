import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchActiveFlashSaleProducts,
  fetchUpcomingFlashSaleProducts,
} from '../api/products';
import { createOrder } from '../api/orders';
import FlashSaleProductCard from '../components/FlashSaleProductCard';
import CountdownTimer from '../components/CountdownTimer';
import type { FlashSaleProduct } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [activeProducts, setActiveProducts] = useState<FlashSaleProduct[]>([]);
  const [upcomingProducts, setUpcomingProducts] = useState<FlashSaleProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const [active, upcoming] = await Promise.all([
        fetchActiveFlashSaleProducts(),
        fetchUpcomingFlashSaleProducts(),
      ]);
      setActiveProducts(active);
      setUpcomingProducts(upcoming);
      setError(null);
    } catch {
      setError('Failed to load flash sale products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    const interval = window.setInterval(loadProducts, 30000);
    return () => window.clearInterval(interval);
  }, [loadProducts]);

  const soonestEndDate = useMemo(() => {
    if (activeProducts.length === 0) return null;
    const min = activeProducts
      .map((p) => new Date(p.end_date).getTime())
      .filter((t) => Number.isFinite(t) && t > Date.now())
      .reduce((acc, t) => (t < acc ? t : acc), Infinity);
    return Number.isFinite(min) ? min : null;
  }, [activeProducts]);

  async function handleBuy(flashSaleProductId: string) {
    setBuyingId(flashSaleProductId);
    setError(null);
    try {
      const order = await createOrder(flashSaleProductId);
      navigate(`/orders/${order.id}`);
    } catch {
      setError('Could not create order. The item may be sold out.');
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Limited time only</span>
          <h1 className="hero-title">
            Flash deals that <span>disappear fast</span>
          </h1>
          <p className="hero-sub">
            Grab today’s hottest products before the timer runs out. New deals
            drop every hour.
          </p>
          {soonestEndDate && (
            <CountdownTimer
              targetDate={new Date(soonestEndDate).toISOString()}
              label="Next deal ends in"
              variant="banner"
              tone="red"
            />
          )}
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-bolt">⚡</div>
        </div>
      </section>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <section className="section">
        <header className="section-header section-header-flash">
          <div className="section-header-left">
            <h2>
              <span className="flash-pill">FLASH SALE</span>
              <span className="section-title-text">On Now</span>
            </h2>
          </div>
        </header>

        {loading && activeProducts.length === 0 ? (
          <ProductSkeletonGrid />
        ) : activeProducts.length === 0 ? (
          <EmptyState message="No active flash sales right now. Check back soon!" />
        ) : (
          <div className="product-grid">
            {activeProducts.map((product) => (
              <div key={product.id} className="product-grid-item">
                <FlashSaleProductCard
                  product={product}
                  variant="active"
                  onBuy={handleBuy}
                  buying={buyingId === product.id}
                />
                <CountdownTimer
                  targetDate={product.end_date}
                  label="Ends in"
                  variant="inline"
                  tone="red"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <header className="section-header">
          <h2>
            <span className="upcoming-pill">UPCOMING</span>
            <span className="section-title-text">Get Ready</span>
          </h2>
        </header>

        {loading && upcomingProducts.length === 0 ? (
          <ProductSkeletonGrid />
        ) : upcomingProducts.length === 0 ? (
          <EmptyState message="No upcoming flash sales scheduled." />
        ) : (
          <div className="product-grid">
            {upcomingProducts.map((product) => (
              <div key={product.id} className="product-grid-item">
                <FlashSaleProductCard product={product} variant="upcoming" />
                <CountdownTimer
                  targetDate={product.start_date}
                  label="Starts in"
                  variant="inline"
                  tone="red"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="product-grid">
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="product-card skeleton-card" key={i}>
          <div className="skeleton skeleton-thumb" />
          <div className="product-card-body">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        ✨
      </div>
      <p>{message}</p>
    </div>
  );
}
