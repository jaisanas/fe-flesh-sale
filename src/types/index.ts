export interface User {
  id: number | string;
  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user?: User;
}

export interface FlashSaleProduct {
  id: string;
  product_id: string;
  product_name: string;
  stock: number;
  price: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
  cached_stock?: number;
  is_active?: boolean;
  is_upcoming?: boolean;
}

export type OrderStatus = 'created' | 'pending' | 'paid' | 'cancelled';

export interface Order {
  id: number | string;
  user_id?: number | string;
  userId?: number | string;
  product_id?: number | string;
  flash_sale_product_id?: number | string;
  flashSaleProductId?: number | string;
  product_name?: string;
  price?: string | number;
  status: OrderStatus;
  flash_sale_product?: FlashSaleProduct;
  flashSaleProduct?: FlashSaleProduct;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
}
