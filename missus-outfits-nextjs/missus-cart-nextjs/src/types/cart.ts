// src/types/cart.ts

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  size: string;
  color: string;
  colorHex: string;
  quantity: number;
  image?: string;
  badge?: "SALE" | "NEW" | "DEAL";
}

export interface CartState {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;
}

export interface UpsellProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  colors: { name: string; hex: string }[];
  bgColor: string;
}
