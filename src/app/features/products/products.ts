import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Product } from '../../shared/models/product.model';
import { BackendService } from '../../core/services/backend.service';

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
  categories: any[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  // Modal de producto
  selectedProduct: Product | null = null;
  showProductModal: boolean = false;

  constructor(private backendService: BackendService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.initScrollAnimation();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    
    this.backendService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products.map(product => ({
          ...product,
          inStock: product.stock > 0 // Calcular inStock basado en stock
        }));
        this.filterProducts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Error al cargar los productos';
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.backendService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  ngOnDestroy(): void {
    // Limpiar listeners si es necesario
  }

  filterProducts(): void {
    if (this.selectedCategory === 'todos') {
      this.filteredProducts = this.allProducts;
    } else {
      const categoryId = parseInt(this.selectedCategory);
      this.filteredProducts = this.allProducts.filter(product => 
        product.category_id === categoryId
      );
    }
  }

  // Método para cambiar categoría
  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterProducts();
  }

  // Método para obtener nombre de categoría por ID
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Desconocido';
  }

  // Modal de producto
  showProductDetail(product: Product): void {
    this.selectedProduct = product;
    this.showProductModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProduct = null;
    document.body.style.overflow = 'auto';
  }

  // Animaciones de scroll
  private initScrollAnimation(): void {
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right');
      this.checkScrollAnimations();
    }, 100);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.checkScrollAnimations();
  }

  private checkScrollAnimations(): void {
    if (!this.scrollAnimateElements) return;

    this.scrollAnimateElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animate-visible');
      }
    });
  }

  // Método para manejar errores de carga de imagen
  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-coffee.jpg'; // Imagen por defecto
  }
}
