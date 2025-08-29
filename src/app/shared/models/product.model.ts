export interface Product {
  id: number;
  description: string;
  imageUrl: string; 
  name: string;
  price: number;
  stock: number;
  category_id: number;
  category: Category;
  presentationPrices?: { [key: string]: number }; 
  
  // Campos opcionales para compatibilidad con el frontend existente
  originalPrice?: number;
  inStock?: boolean;
  isOnSale?: boolean;
  salePercentage?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  origin?: string;
  weight?: string;

}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface ProductPresentation {
  name: string;
  price: number;
}