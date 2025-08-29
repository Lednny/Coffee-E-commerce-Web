import { Component, Input, Output, EventEmitter } from '@angular/core';
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
export class ProductCard {
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

  constructor(private cartService: CartService, private backendService: BackendService) {}

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
      this.showSuccessMessage();
    }, 500);
  }

  private showSuccessMessage(): void {
    // Implementa según tu sistema de notificaciones
    // Por ejemplo, usando una librería como ngx-toastr
    console.log('¡Producto agregado exitosamente!');
  }

  private showErrorMessage(): void {
    // Implementa según tu sistema de notificaciones
    console.log('Error al agregar el producto al carrito');
  }

  onImageLoad(): void {
    this.imageLoaded = true;
  }

  onImageError(event: any): void {
    console.error('Error loading image for product:', this.product.name);
    this.imageLoaded = true;
  }

  private initializePresentations() {
    if (this.product.presentationPrices && Object.keys(this.product.presentationPrices).length > 0) {
      // Tiene presentaciones
      this.availablePresentations = Object.entries(this.product.presentationPrices).map(([name, price]) => ({
        name,
        price
      }));
      // Seleccionar la primera presentación por defecto
      this.selectedPresentation = this.availablePresentations[0].name;
      this.currentPrice = this.availablePresentations[0].price;
    } else {
      // No tiene presentaciones, usar precio base
      this.currentPrice = this.product.price;
    }
  }

    onPresentationChange(presentationName: string) {
    this.selectedPresentation = presentationName;
    const selectedPres = this.availablePresentations.find(p => p.name === presentationName);
    if (selectedPres) {
      this.currentPrice = selectedPres.price;
    }
  }

  
}