import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Cart as CartModel } from '../../shared/models/cart.interface';
import { CartItem } from '../../shared/models/cart-item.interface';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit, OnDestroy {
  cart$: Observable<CartModel>;
  isLoading = false;
  private subscription = new Subscription();

  constructor(private cartService: CartService) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    // Cargar el carrito al inicializar el componente
    this.cartService.loadCart();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Incrementar cantidad
  increaseQuantity(item: CartItem): void {
    if (!item.id) {
      console.error('Item ID is required to update quantity');
      return;
    }
    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  // Decrementar cantidad
  decreaseQuantity(item: CartItem): void {
    if (!item.id) {
      console.error('Item ID is required to update quantity');
      return;
    }
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
    } else {
      this.removeItem(item);
    }
  }

  // Actualizar cantidad directamente
  updateQuantity(item: CartItem, event: Event): void {
    if (!item.id) {
      console.error('Item ID is required to update quantity');
      return;
    }
    const target = event.target as HTMLInputElement;
    const newQuantity = parseInt(target.value, 10);
    
    if (newQuantity > 0) {
      this.cartService.updateQuantity(item.id, newQuantity);
    } else {
      this.removeItem(item);
    }
  }

  // Remover item individual
  removeItem(item: CartItem): void {
    if (!item.id) {
      console.error('Item ID is required to remove item');
      return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
      this.cartService.removeFromCart(item.id);
    }
  }

  // Limpiar todo el carrito
  clearCart(): void {
    if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      this.cartService.clearCart();
    }
  }

  // Calcular total del carrito
  getCartTotal(): number {
    return this.cartService.getCartTotal();
  }

  // Obtener conteo de items
  getItemsCount(): number {
    return this.cartService.getCartItemsCount();
  }

  // Formatear precio
  formatPrice(price: number): string {
    return `$${price.toLocaleString()}`;
  }
}
