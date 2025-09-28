import { AuthService } from '../auth/data-access/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { BackendService } from '../../core/services/backend.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { StripeService } from '../../core/services/stripe.service';
import { Cart as CartModel } from '../../shared/models/cart.interface';
import { CartItem } from '../../shared/models/cart-item.interface';
import { AddressDTO } from '../../shared/models/address.interface';
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
  addresses: AddressDTO[] = [];
  private subscription = new Subscription();

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private stripeService: StripeService,
    private backendService: BackendService
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
    this.isLoading = true;
    this.backendService.getUserAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.isLoading = false;

        // Seleccionar la primera dirección por defecto
        if (this.addresses.length > 0 && this.addresses[0].id) {
          this.selectedAddressId = this.addresses[0].id;
        }
      },
      error: (error) => {
        console.error('Error cargando direcciones:', error);
        this.isLoading = false;

        // Si hay error, mostrar mensaje al usuario
        if (error.status === 401) {
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
          console.warn('No se pudieron cargar las direcciones. El usuario deberá agregar una dirección.');
        }
      }
    });
  }

  // Seleccionar dirección
  selectAddress(addressId: number): void {
    this.selectedAddressId = addressId;
  }

  // Refrescar direcciones (útil si vienen de configuración)
  refreshAddresses(): void {
    this.loadUserAddresses();
  }

  // Obtener dirección completa para mostrar
  getAddressDisplay(address: AddressDTO): string {
    return `${address.street}, ${address.city}, ${address.state}, ${address.country}`;
  }

  // Proceso completo de checkout
async processCheckout() {

    // Validar que haya direcciones disponibles
    if (this.addresses.length === 0) {
        alert('No tienes direcciones registradas. Por favor, ve a Configuración para agregar una dirección.');
        return;
    }

    if (!this.selectedAddressId) {
        alert('Por favor selecciona una dirección de entrega');
        return;
    }

    this.isProcessing = true;

    try {
        // Verificar token
        const token = localStorage.getItem('auth_token');
        if (!token) {
            alert('Necesitas iniciar sesión para continuar');
            this.isProcessing = false;
            return;
        }

        // Crear la orden usando OrderService
        const order = await this.orderService.createOrder(this.selectedAddressId).toPromise();

        if (!order) {
            throw new Error('No se pudo crear la orden');
        }
        const checkoutSession = await this.stripeService.createCheckoutSession(order.id).toPromise();

        if (checkoutSession?.checkoutUrl) {
            window.location.href = checkoutSession.checkoutUrl;
        } else {
            throw new Error('No se pudo obtener la URL de pago');
        }

    } catch (error: any) {
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
