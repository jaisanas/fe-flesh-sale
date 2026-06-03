import type { FlashSaleProduct, Order } from '../types';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function parsePrice(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatRupiah(
  value: string | number | null | undefined
): string {
  const num = parsePrice(value);
  return rupiahFormatter.format(num).replace('IDR', 'Rp').trim();
}

export function progressPercent(remaining: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
}

export function getOrderProduct(order: Order): FlashSaleProduct | undefined {
  return order.flash_sale_product ?? order.flashSaleProduct;
}

export function getOrderFlashSaleProductId(order: Order): string | number {
  return (
    order.flash_sale_product_id ??
    order.flashSaleProductId ??
    getOrderProduct(order)?.id ??
    ''
  );
}

export function getOrderDisplayName(order: Order): string {
  return (
    order.product_name ??
    getOrderProduct(order)?.product_name ??
    `Flash Sale #${getOrderFlashSaleProductId(order)}`
  );
}

export function getOrderDisplayPrice(order: Order): number {
  return parsePrice(order.price ?? getOrderProduct(order)?.price);
}

export function isAwaitingPayment(order: Order): boolean {
  return order.status === 'pending' || order.status === 'created';
}
