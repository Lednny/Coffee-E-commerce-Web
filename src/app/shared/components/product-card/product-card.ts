import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../models/cart-item.interface';

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

  constructor(private cartService: CartService) {}

  getCategoryName(categoryId: number): string {
    const categoryNames: { [key: number]: string } = {
      1: 'EN GRANO',
      2: 'MOLIDO', 
      3: 'ESPECIAL'
    };
    return categoryNames[categoryId] || 'CAFÉ';
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
}