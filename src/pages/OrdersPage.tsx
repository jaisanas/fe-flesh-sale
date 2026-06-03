import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../api/orders';
import {
  formatRupiah,
  getOrderDisplayName,
  getOrderDisplayPrice,
} from '../utils/format';
import type { Order } from '../types';

function formatDate(value: string | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchOrders();
        if (!cancelled) setOrders(data);
      } catch {
        if (!cancelled) setError('Failed to load orders.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="loading">Loading orders…</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="orders-page">
      <header className="page-header">
        <h1>My Orders</h1>
        <p className="page-subtitle">Track your flash sale purchases</p>
      </header>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            🛍️
          </div>
          <p>You have no orders yet.</p>
          <Link to="/" className="btn btn-primary">
            Browse flash deals
          </Link>
        </div>
      ) : (
        <ul className="order-list">
          {orders.map((order) => {
            const name = getOrderDisplayName(order);
            const price = getOrderDisplayPrice(order);
            const createdAt = formatDate(order.created_at ?? order.createdAt);
            return (
              <li key={order.id} className="order-list-item">
                <Link to={`/orders/${order.id}`} className="order-row">
                  <div className="order-row-thumb order-row-thumb-empty">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="order-row-info">
                    <div className="order-row-meta">
                      <span className="order-row-id">Order #{order.id}</span>
                      <span className={`status status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-row-name">{name}</div>
                    {createdAt && (
                      <div className="order-row-date">{createdAt}</div>
                    )}
                  </div>
                  <div className="order-row-price">{formatRupiah(price)}</div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
