import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Cart } from '../../shared/models/cart.interface';
import { CartItem } from '../../shared/models/cart-item.interface';
import { Product } from '../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/cart';

  // Subject para el carrito (para el navbar)
  private cartSubject = new BehaviorSubject<Cart>({
    id: 0,
    items: []
  });
  public cartItems$ = this.cartSubject.asObservable();
  public cart$ = this.cartSubject.asObservable(); // Alias para compatibilidad

  constructor(private http: HttpClient) {
    // Cargar el carrito inicial
    this.loadCart();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.warn('No auth token found for cart request');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    // Verificar si el token ha expirado
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const isExpired = payload.exp < Date.now() / 1000;

        if (isExpired) {
          console.warn('Token expired, removing from storage');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
          return new HttpHeaders({
            'Content-Type': 'application/json'
          });
        }
      }
    } catch (error) {
      console.error('Error parsing token:', error);
      localStorage.removeItem('auth_token');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  public loadCart(): void {
    this.getMyCart().subscribe({
      next: (cart) => {
        this.cartSubject.next(cart);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        // En caso de error, mantener carrito vacío
        this.cartSubject.next({ id: 0, items: [] });
      }
    });
  }

  // Métodos del carrito con headers de autenticación
  getMyCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error getting cart:', error);
        return of({ id: 0, items: [] }); // Retorna carrito vacío en caso de error
      })
    );
  }

  addItemToCart(item: CartItem): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/add`, item, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(cart => this.cartSubject.next(cart)) // Actualiza el subject automáticamente
    );
  }

  removeItemFromCart(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/remove/${itemId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
      }),
      catchError(error => {
        console.error('Error removing item from cart:', error);

        // Si hay error 401, limpiar tokens y recargar carrito
        if (error.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
        }

        // Retornar el carrito actual en caso de error para evitar crash
        const currentCart = this.cartSubject.value;
        return of(currentCart);
      })
    );
  }

  updateItemQuantity(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/update/${itemId}?quantity=${quantity}`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  // Métodos para el navbar (compatibilidad)
  removeFromCart(itemId: number): void {

    // Optimistic update: eliminar localmente primero
    const currentCart = this.cartSubject.value;
    const updatedItems = currentCart.items.filter(item => item.id !== itemId);
    const updatedCart = { ...currentCart, items: updatedItems };

    // Actualizar inmediatamente la UI
    this.cartSubject.next(updatedCart);

    // Luego sincronizar con el backend
    this.removeItemFromCart(itemId).subscribe({
      next: (cart) => {
        // Actualizar con la respuesta del backend para mantener consistencia
        this.cartSubject.next(cart);
      },
      error: (error) => {
        console.error('Error removing item from cart on backend:', error);
        // Si falla, revertir el cambio optimista recargando desde el backend
        this.loadCart();
      }
    });
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    this.updateItemQuantity(itemId, quantity).subscribe({
      next: (cart) => {
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
      }
    });
  }

  clearCart(): void {
    this.http.delete<Cart>(`${this.apiUrl}/clear`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (cart) => {
        this.cartSubject.next(cart);
      },
      error: (error) => {
        console.error('Error al limpiar carrito:', error);
      }
    });
  }

  getCartItemsCount(): number {
    const cart = this.cartSubject.value;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): number {
    const cart = this.cartSubject.value;
    return cart.items.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
  }

  // Método público para refrescar el carrito
  refreshCart(): void {
    this.loadCart();
  }

  addToCart(product: Product): void {
    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      productDescription: product.description,
      productImageUrl: product.imageUrl,
      productPrice: product.price,
      productCategory: this.getCategoryName(product.category_id),
      quantity: 1,

    };



    this.addItemToCart(cartItem).subscribe({
      next: (cart) => {

        // Forzar actualización del carrito desde el servidor
        this.loadCart();
      },
      error: (error) => {
        console.error('Error al agregar producto al carrito:', error);
        console.error('Detalles del error:', error.error);
      }
    });
  }

  private getCategoryName(categoryId: number): string {
    const categoryNames: { [key: number]: string } = {
      1: 'En Grano',
      2: 'Molido',
      3: 'Especial'
    };
    return categoryNames[categoryId] || 'Sin categoría';
  }
}
