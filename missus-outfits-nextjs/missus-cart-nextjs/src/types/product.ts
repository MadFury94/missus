// src/types/product.ts

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  colors: ProductColor[];
  sizes: ProductSize[];
  category: string;
  badge?: "NEW" | "SALE" | "DEAL" | "BESTSELLER";
  bgColor: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  description?: string;
  details?: string[];
  images?: string[];
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSize {
  label: string;
  inStock: boolean;
}

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";
