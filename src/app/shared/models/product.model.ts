export interface Product {
  id: number;
  description: string;
  image_url: string;
  name: string;
  price: number;
  stock: number;
  category_id: number;
  
  // Campos opcionales para compatibilidad con el frontend existente
  originalPrice?: number;
  inStock?: boolean;
  isOnSale?: boolean;
  salePercentage?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  roastLevel?: 'claro' | 'medio' | 'oscuro';
  origin?: string;
  weight?: string;
}