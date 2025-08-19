import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterModule, CommonModule, ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit, OnDestroy {
  private scrollAnimateElements: NodeListOf<HTMLElement> | null = null;

  // Filtros y estado
  selectedCategory: string = 'todos';
  filteredProducts: Product[] = [];
  allProducts: Product[] = [];
  
  // Modal de producto
  selectedProduct: Product | null = null;
  showProductModal: boolean = false;

  // Productos en grano
  granoProducts: Product[] = [
    {
      id: 'g1',
      name: 'GRANO COLOMBIANO HUILA',
      description: 'Origen único, tostado medio, notas dulces de panela y chocolate',
      price: 28900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'grano',
      inStock: true,
      rating: 4.6,
      reviewCount: 156,
      origin: 'Huila, Colombia',
      weight: '500g',
      roastLevel: 'medio',
      tags: ['Single Origin', 'Dulce']
    },
    {
      id: 'g2',
      name: 'GRANO BRASILEÑO CERRADO',
      description: 'Tostado oscuro, notas de nuez y cacao intenso',
      price: 26900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'grano',
      inStock: true,
      rating: 4.3,
      reviewCount: 98,
      origin: 'Cerrado, Brasil',
      weight: '500g',
      roastLevel: 'oscuro',
      tags: ['Intenso', 'Cacao']
    },
    {
      id: 'g3',
      name: 'GRANO ETÍOPE SIDAMO',
      description: 'Tostado claro, notas florales y cítricas brillantes',
      price: 32900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'grano',
      inStock: true,
      rating: 4.8,
      reviewCount: 234,
      origin: 'Sidamo, Etiopía',
      weight: '250g',
      roastLevel: 'claro',
      tags: ['Floral', 'Cítrico', 'Premium']
    }
  ];

  // Productos molidos
  molidoProducts: Product[] = [
    {
      id: 'm1',
      name: 'MOLIDO ESPRESSO NAPOLITANO',
      description: 'Molienda fina, ideal para máquinas espresso, sabor intenso',
      price: 24900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'molido',
      inStock: true,
      rating: 4.4,
      reviewCount: 187,
      origin: 'Blend Internacional',
      weight: '250g',
      roastLevel: 'oscuro',
      tags: ['Espresso', 'Intenso']
    },
    {
      id: 'm2',
      name: 'MOLIDO FILTRO AMERICANO',
      description: 'Molienda media, perfecto para cafetera de filtro y V60',
      price: 22900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'molido',
      inStock: true,
      rating: 4.2,
      reviewCount: 145,
      origin: 'Colombia-Brasil',
      weight: '250g',
      roastLevel: 'medio',
      tags: ['Filtro', 'Equilibrado']
    },
    {
      id: 'm3',
      name: 'MOLIDO PRENSA FRANCESA',
      description: 'Molienda gruesa, ideal para prensa francesa, cuerpo completo',
      price: 23900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'molido',
      inStock: true,
      rating: 4.5,
      reviewCount: 112,
      origin: 'Guatemala',
      weight: '500g',
      roastLevel: 'medio',
      tags: ['Prensa', 'Cuerpo Completo']
    }
  ];

  // Productos especiales
  especialProducts: Product[] = [
    {
      id: 'e1',
      name: 'EDICIÓN LIMITADA GEISHA',
      description: 'Variedad Geisha, proceso honey, notas florales únicas',
      price: 45900,
      originalPrice: 52900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'especial',
      inStock: true,
      isOnSale: true,
      salePercentage: 13,
      rating: 4.9,
      reviewCount: 67,
      origin: 'Boquete, Panamá',
      weight: '250g',
      roastLevel: 'claro',
      tags: ['Geisha', 'Honey Process', 'Ultra Premium']
    },
    {
      id: 'e2',
      name: 'MEZCLA DEL MAESTRO',
      description: 'Blend exclusivo creado por nuestro maestro tostador',
      price: 38900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'especial',
      inStock: true,
      rating: 4.7,
      reviewCount: 203,
      origin: 'Blend Secreto',
      weight: '500g',
      roastLevel: 'medio',
      tags: ['Signature', 'Exclusive', 'Master Blend']
    },
    {
      id: 'e3',
      name: 'CAFÉ DE TEMPORADA NAVIDEÑO',
      description: 'Blend especial con notas de canela, vainilla y especias',
      price: 35900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'especial',
      inStock: false,
      rating: 4.6,
      reviewCount: 89,
      origin: 'Colombia-Honduras',
      weight: '250g',
      roastLevel: 'medio',
      tags: ['Temporada', 'Especias', 'Navideño']
    }
  ];

  ngOnInit() {
    // Combinar todos los productos
    this.allProducts = [...this.granoProducts, ...this.molidoProducts, ...this.especialProducts];
    this.filteredProducts = this.allProducts;
    
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right');
      this.checkScrollAnimations();
    }, 100);
  }

  ngOnDestroy() {
  }
  
  // Abrir modal de producto
  openProductModal(product: Product) {
    this.selectedProduct = product;
    this.showProductModal = true;
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
  }

  // Cerrar modal de producto
  closeProductModal() {
    this.showProductModal = false;
    this.selectedProduct = null;
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  // Obtener nombre legible de la categoría
  getCategoryName(category: string): string {
    switch (category) {
      case 'grano':
        return 'Café en Grano';
      case 'molido':
        return 'Café Molido';
      case 'especial':
        return 'Edición Especial';
      default:
        return category;
    }
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.checkScrollAnimations();
  }

  checkScrollAnimations() {
    if (!this.scrollAnimateElements) return;

    this.scrollAnimateElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animate-visible');
      }
    });
  }
}
