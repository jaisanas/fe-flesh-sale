import axios from 'axios';
import { API_BASE_URL, STATIC_DEV_TOKEN } from '../config';
import type { FlashSaleProduct } from '../types';

const devHeaders = {
  Authorization: `Bearer ${STATIC_DEV_TOKEN}`,
};

export async function fetchActiveFlashSaleProducts(): Promise<
  FlashSaleProduct[]
> {
  const { data } = await axios.get<FlashSaleProduct[]>(
    `${API_BASE_URL}/flash-sale-products`,
    { params: { active: true }, headers: devHeaders }
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchUpcomingFlashSaleProducts(): Promise<
  FlashSaleProduct[]
> {
  const { data } = await axios.get<FlashSaleProduct[]>(
    `${API_BASE_URL}/flash-sale-products`,
    { params: { upcoming: true }, headers: devHeaders }
  );
  return Array.isArray(data) ? data : [];
}
