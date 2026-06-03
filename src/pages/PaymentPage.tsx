import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchOrder, updateOrderStatus } from '../api/orders';
import {
  formatRupiah,
  getOrderDisplayName,
  getOrderDisplayPrice,
  isAwaitingPayment,
} from '../utils/format';
import type { Order } from '../types';

type PaymentMethod = 'va' | 'card' | 'ewallet';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; sub: string }[] = [
  { id: 'va', label: 'Virtual Account', sub: 'BCA, BNI, Mandiri, BRI' },
  { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard' },
  { id: 'ewallet', label: 'E-Wallet', sub: 'GoPay, OVO, Dana, ShopeePay' },
];

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('va');

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

  async function handlePay() {
    if (!orderId) return;
    setProcessing(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(orderId, 'paid');
      navigate(`/orders/${updated.id}`);
    } catch {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  async function handleCancel() {
    if (!orderId) return;
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    setProcessing(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(orderId, 'cancelled');
      navigate(`/orders/${updated.id}`);
    } catch {
      setError('Could not cancel order.');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <p className="loading">Loading payment…</p>;
  if (!order)
    return (
      <div className="alert alert-error">{error ?? 'Order not found.'}</div>
    );

  if (!isAwaitingPayment(order)) {
    return (
      <div className="checkout-page">
        <div className="card">
          <p>This order is already {order.status}.</p>
          <Link to={`/orders/${order.id}`} className="btn btn-primary">
            View order
          </Link>
        </div>
      </div>
    );
  }

  const amount = getOrderDisplayPrice(order);
  const productName = getOrderDisplayName(order);

  return (
    <div className="checkout-page">
      <nav className="breadcrumb">
        <Link to="/orders">My orders</Link>
        <span>›</span>
        <Link to={`/orders/${order.id}`}>Order #{order.id}</Link>
        <span>›</span>
        <span>Payment</span>
      </nav>

      <div className="checkout-grid">
        <div className="card checkout-main">
          <h2>Choose a payment method</h2>
          <div className="payment-methods">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.id}
                className={`payment-method ${method === m.id ? 'is-selected' : ''}`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={m.id}
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                />
                <div>
                  <div className="payment-method-label">{m.label}</div>
                  <div className="payment-method-sub">{m.sub}</div>
                </div>
                <span className="payment-method-check" aria-hidden="true">
                  ●
                </span>
              </label>
            ))}
          </div>

          {error && <div className="alert alert-error">{error}</div>}
        </div>

        <aside className="card checkout-summary">
          <h3>Payment Summary</h3>
          <p className="payment-product">{productName}</p>
          <dl className="summary-list">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatRupiah(amount)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>Free</dd>
            </div>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{formatRupiah(amount)}</dd>
            </div>
          </dl>

          <button
            type="button"
            className="btn btn-primary btn-block btn-lg"
            onClick={handlePay}
            disabled={processing}
          >
            {processing ? 'Processing…' : `Pay ${formatRupiah(amount)}`}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={handleCancel}
            disabled={processing}
          >
            Cancel order
          </button>
        </aside>
      </div>
    </div>
  );
}
