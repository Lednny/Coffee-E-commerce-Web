import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { BackendService } from '../../../core/services/backend.service';
import { ProductPresentation } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard implements OnInit, OnDestroy {
  @Input() product!: Product;
  @Input() animationDelay: string = '';
  @Output() viewMore = new EventEmitter<Product>();

  // Estado del componente
  isAddingToCart = false;
  selectedPresentation: string = '';
  currentPrice: number = 0;
  availablePresentations: ProductPresentation[] = [];

  // Recarga de las imágenes
  imageLoaded = false;
  imageError = false;
  retryCount = 0;
  maxRetries = 3;

  constructor(private cartService: CartService, private backendService: BackendService) {}

  ngOnInit() {
    this.initializePresentations();
    this.preloadImage();
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  // Precargar imagen para mejor rendimiento
  private preloadImage(): void {
    if (this.product.imageUrl) {
      const img = new Image();
      img.onload = () => {
        this.imageLoaded = true;
        this.imageError = false;
      };
      img.onerror = () => {
        this.handleImageError();
      };
      img.src = this.product.imageUrl;
    } else {
      this.imageError = true;
    }
  }

  private handleImageError(): void {
    this.retryCount++;
    if (this.retryCount < this.maxRetries) {
      // Intentar de nuevo después de un delay
      setTimeout(() => {
        this.preloadImage();
      }, 1000 * this.retryCount);
    } else {
      this.imageError = true;
      this.imageLoaded = true; // Para mostrar el placeholder
    }
  }

  getCategoryName(categoryId: number): string {
    const categoryNames: { [key: number]: string } = {
      1: 'MESAS',
      2: 'SILLAS',
      3: 'CLOSÉT'
    };
    return categoryNames[categoryId] || 'MUEBLES';
  }

  // Método para verificar si el producto está en stock
  isInStock(): boolean {
    return this.product.stock > 0;
  }

  onViewMore() {
    this.viewMore.emit(this.product);
  }

  // MÉTODO CORREGIDO para agregar al carrito
  addToCart(): void {
    if (this.isAddingToCart || !this.isInStock()) return; // Evitar múltiples clicks y verificar stock

    this.isAddingToCart = true;

    // Usar el método addToCart del servicio que ya tiene mejor manejo
    this.cartService.addToCart(this.product);

    // Simular un pequeño delay para UX
    setTimeout(() => {
      this.isAddingToCart = false;
    }, 500);
  }

  onImageLoad(): void {
    this.imageLoaded = true;
    this.imageError = false;
  }

  onImageError(event: any): void {
    console.error('Error loading image for product:', this.product.name, event);
    this.handleImageError();
  }

  // Obtener URL de imagen con fallback
  getImageUrl(): string {
    if (this.imageError) {
      return '/assets/images/placeholder-product.jpg';
    }
    return this.product.imageUrl || '/assets/images/placeholder-product.jpg';
  }

  private initializePresentations() {
    if (this.product.presentationPrices && Object.keys(this.product.presentationPrices).length > 0) {
      // Tiene presentaciones
      this.availablePresentations = Object.entries(this.product.presentationPrices).map(([name, price]) => ({
        name,
        price
      }));
      // Seleccionar la primera presentación por defecto
      if (this.availablePresentations.length > 0) {
        this.selectedPresentation = this.availablePresentations[0].name;
        this.currentPrice = this.availablePresentations[0].price;
      }
    } else {
      // No tiene presentaciones, usar precio base
      this.currentPrice = this.product.price || 0;
      this.availablePresentations = [];
    }
  }

  onPresentationChange(presentationName: string) {
    this.selectedPresentation = presentationName;
    const selectedPres = this.availablePresentations.find(p => p.name === presentationName);
    if (selectedPres) {
      this.currentPrice = selectedPres.price;
    }
  }

  // Obtener precio formateado
  getFormattedPrice(): string {
    return `$${(this.currentPrice || this.product.price || 0).toLocaleString()}`;
  }


}
