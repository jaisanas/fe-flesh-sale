import { apiClient } from './client';
import type { Order, OrderStatus } from '../types';

export async function createOrder(
  flashSaleProductId: string | number
): Promise<Order> {
  const { data } = await apiClient.post<Order>('/orders', {
    flashSaleProductId,
  });
  return data;
}

export async function fetchOrder(orderId: string | number): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${orderId}`);
  return data;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>('/orders');
  return Array.isArray(data) ? data : [];
}

export async function updateOrderStatus(
  orderId: string | number,
  status: OrderStatus
): Promise<Order> {
  const { data } = await apiClient.patch<Order>(`/orders/${orderId}`, {
    status,
  });
  return data;
}
