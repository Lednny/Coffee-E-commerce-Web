export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Para mostrar precio anterior en ofertas
  imageUrl: string;
  category: 'grano' | 'molido' | 'especial';
  inStock: boolean;
  isOnSale?: boolean;
  salePercentage?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  roastLevel?: 'claro' | 'medio' | 'oscuro';
  origin?: string;
  weight?: string;
}