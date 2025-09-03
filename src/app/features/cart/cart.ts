import { AuthService } from '../auth/data-access/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { StripeService } from '../../core/services/stripe.service';
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
  isProcessing = false;
  selectedAddressId: number | null = null;
  addresses: any[] = [];
  private subscription = new Subscription();

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private stripeService: StripeService,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    // Cargar el carrito al inicializar el componente
    this.cartService.loadCart();
    this.loadUserAddresses();
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

  // Cargar direcciones del usuario
  loadUserAddresses(): void {
    // Temporal: direcciones de ejemplo hasta que tengas el AddressService
    this.addresses = [
      { id: 1, name: 'Casa', address: 'Calle Principal 123, Medellín, Colombia' },
      { id: 2, name: 'Trabajo', address: 'Av. Comercial 456, Medellín, Colombia' },
      { id: 3, name: 'Otro', address: 'Carrera 15 #28-34, Medellín, Colombia' }
    ];
    
    // Seleccionar la primera dirección por defecto
    if (this.addresses.length > 0) {
      this.selectedAddressId = this.addresses[0].id;
    }
    
    console.log('Direcciones cargadas:', this.addresses);
    console.log('Dirección seleccionada por defecto:', this.selectedAddressId);
  }

  // Seleccionar dirección
  selectAddress(addressId: number): void {
    this.selectedAddressId = addressId;
    console.log('Nueva dirección seleccionada:', addressId);
  }

  // Proceso completo de checkout
async processCheckout() {
    console.log('=== INICIANDO CHECKOUT ===');
    console.log('AddressId seleccionado:', this.selectedAddressId);
    console.log('Direcciones disponibles:', this.addresses);
    
    if (!this.selectedAddressId) {
        alert('Por favor selecciona una dirección');
        return;
    }

    this.isProcessing = true;

    try {
        // Verificar token
        const token = localStorage.getItem('auth_token');
        console.log('Token presente:', !!token);
        console.log('Token (primeros 20 chars):', token?.substring(0, 20));
        
        if (!token) {
            alert('Necesitas iniciar sesión para continuar');
            this.isProcessing = false;
            return;
        }
        
        console.log('Enviando petición de orden...');
        console.log('URL que se va a llamar:', `http://localhost:8080/api/orders/create?addressId=${this.selectedAddressId}`);
        
        // Crear la orden
        const order = await this.orderService.createOrder(this.selectedAddressId).toPromise();
        
        if (!order) {
            throw new Error('No se pudo crear la orden');
        }
        console.log('✅ Orden creada exitosamente:', order);

        console.log('Creando sesión de Stripe...');
        const checkoutSession = await this.stripeService.createCheckoutSession(order.id).toPromise();
        
        if (checkoutSession?.url) {
            console.log('✅ Redirigiendo a Stripe:', checkoutSession.url);
            window.location.href = checkoutSession.url;
        } else {
            throw new Error('No se pudo obtener la URL de pago');
        }

    } catch (error: any) {
        console.error('❌ Error en el checkout:', error);
        console.error('Error completo:', error);
        
        if (error.status === 400) {
            alert('Datos inválidos. Verifica que hayas seleccionado una dirección válida.');
        } else if (error.status === 403) {
            alert('No tienes autorización. Por favor, inicia sesión nuevamente.');
        } else if (error.status === 401) {
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
            alert(`Error: ${error.message || 'Error desconocido'}`);
        }
        
        this.isProcessing = false;
    }
}
}
