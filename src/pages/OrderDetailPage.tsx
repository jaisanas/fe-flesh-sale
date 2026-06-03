import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchOrder } from '../api/orders';
import {
  formatRupiah,
  getOrderDisplayName,
  getOrderDisplayPrice,
  isAwaitingPayment,
} from '../utils/format';
import type { Order } from '../types';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchOrder(orderId);
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled) setError('Failed to load order.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) return <p className="loading">Loading order…</p>;
  if (error || !order) {
    return (
      <div className="alert alert-error">{error ?? 'Order not found.'}</div>
    );
  }

  const productName = getOrderDisplayName(order);
  const price = getOrderDisplayPrice(order);
  const canPay = isAwaitingPayment(order);

  return (
    <div className="checkout-page">
      <nav className="breadcrumb">
        <Link to="/orders">My orders</Link>
        <span>›</span>
        <span>Order #{order.id}</span>
      </nav>

      <div className="checkout-grid">
        <div className="card checkout-main">
          <div className="checkout-status">
            <span className={`status status-${order.status}`}>
              {order.status}
            </span>
            <span className="checkout-order-id">Order #{order.id}</span>
          </div>

          <div className="checkout-item">
            <div className="checkout-thumb checkout-thumb-empty">
              {productName.charAt(0).toUpperCase()}
            </div>
            <div className="checkout-item-info">
              <h2 className="checkout-item-name">{productName}</h2>
              <p className="checkout-item-qty">Quantity: 1</p>
            </div>
            <div className="checkout-item-price">{formatRupiah(price)}</div>
          </div>

          {order.status === 'paid' && (
            <div className="alert alert-success">
              ✓ Payment received. Your order is confirmed!
            </div>
          )}

          {order.status === 'cancelled' && (
            <div className="alert alert-error">
              This order has been cancelled.
            </div>
          )}
        </div>

        <aside className="card checkout-summary">
          <h3>Order Summary</h3>
          <dl className="summary-list">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatRupiah(price)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>Free</dd>
            </div>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{formatRupiah(price)}</dd>
            </div>
          </dl>

          {canPay && (
            <button
              type="button"
              className="btn btn-primary btn-block btn-lg"
              onClick={() => navigate(`/orders/${order.id}/payment`)}
            >
              Continue to payment
            </button>
          )}

          <Link to="/" className="checkout-back-link">
            ← Keep shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
