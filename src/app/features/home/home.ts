import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Product } from '../../shared/models/product.model';
import { BackendService } from '../../core/services/backend.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, ProductCard],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  private scrollAnimateElements: NodeListOf<HTMLElement> | null = null;

  // Productos destacados para mostrar en Home
  selectedCategory: string = 'todos';
  filteredProducts: Product[] = [];
  categories: any[] = [];
  featuredProducts: Product[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Modal de producto
  selectedProduct: Product | null = null;
  showProductModal: boolean = false;

  constructor(private backendService: BackendService) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.initScrollAnimation();
    this.loadCategories();
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

    // Método para obtener nombre de categoría por ID
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Desconocido';
  }

  loadFeaturedProducts(): void {
    this.loading = true;
    this.error = null;
    
    this.backendService.getProducts().subscribe({
      next: (products) => {
        // Tomar los primeros 3 productos como destacados
        this.featuredProducts = products.slice(0, 3).map(product => ({
          ...product,
          inStock: product.stock > 0
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.error = 'Error al cargar productos destacados';
        this.loading = false;
      }
    });
  }

  // Animaciones de scroll
  private initScrollAnimation(): void {
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right');
      this.checkScrollAnimations();
    }, 100);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScrollAnimations();
  }

  private checkScrollAnimations(): void {
    if (!this.scrollAnimateElements) return;

    this.scrollAnimateElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animate-in');
      }
    });
  }
}
