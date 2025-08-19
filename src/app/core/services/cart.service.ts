import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Product } from '../../shared/models/product.model';
import { AuthService } from '../../features/auth/data-access/auth.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItems.asObservable();

  private favoriteItems = new BehaviorSubject<Product[]>([]);
  public favoriteItems$ = this.favoriteItems.asObservable();

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.loadCartFromStorage();
    this.loadFavoritesFromStorage();
  }

  // Cart Methods
  addToCart(product: Product, quantity: number = 1) {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.showNotification('Debes iniciar sesión para agregar productos al carrito', true);
      this.router.navigate(['/auth/signup']);
      return;
    }

    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentItems.push({ product, quantity });
    }

    this.cartItems.next([...currentItems]);
    this.saveCartToStorage();
    this.showNotification(`${product.name} agregado al carrito`);
  }

  removeFromCart(productId: string) {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => item.product.id !== productId);
    this.cartItems.next(updatedItems);
    this.saveCartToStorage();
  }

  updateQuantity(productId: string, quantity: number) {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(item => item.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.cartItems.next([...currentItems]);
        this.saveCartToStorage();
      }
    }
  }

  clearCart() {
    this.cartItems.next([]);
    this.saveCartToStorage();
  }

  getCartTotal(): number {
    return this.cartItems.value.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  getCartItemsCount(): number {
    return this.cartItems.value.reduce((count, item) => count + item.quantity, 0);
  }

  // Favorites Methods
  addToFavorites(product: Product) {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.showNotification('Debes iniciar sesión para agregar productos a favoritos', true);
      this.router.navigate(['/auth/signup']);
      return;
    }

    const currentFavorites = this.favoriteItems.value;
    if (!this.isInFavorites(product.id)) {
      currentFavorites.push(product);
      this.favoriteItems.next([...currentFavorites]);
      this.saveFavoritesToStorage();
      this.showNotification(`${product.name} agregado a favoritos`);
    }
  }

  removeFromFavorites(productId: string) {
    const currentFavorites = this.favoriteItems.value;
    const updatedFavorites = currentFavorites.filter(product => product.id !== productId);
    this.favoriteItems.next(updatedFavorites);
    this.saveFavoritesToStorage();
  }

  toggleFavorite(product: Product) {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.showNotification('Debes iniciar sesión para gestionar favoritos', true);
      this.router.navigate(['/auth/signup']);
      return;
    }

    if (this.isInFavorites(product.id)) {
      this.removeFromFavorites(product.id);
      this.showNotification(`${product.name} removido de favoritos`);
    } else {
      this.addToFavorites(product);
    }
  }

  isInFavorites(productId: string): boolean {
    return this.favoriteItems.value.some(product => product.id === productId);
  }

  clearFavorites() {
    this.favoriteItems.next([]);
    this.saveFavoritesToStorage();
  }

  // Método para refrescar el carrito desde el storage
  refreshCartFromStorage() {
    this.loadCartFromStorage();
  }

  // Método para refrescar favoritos desde el storage
  refreshFavoritesFromStorage() {
    this.loadFavoritesFromStorage();
  }

  // Storage Methods
  private saveCartToStorage() {
    // Solo guardar si hay elementos en el carrito
    if (this.cartItems.value.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems.value));
    } else {
      localStorage.removeItem('cartItems');
    }
  }

  private loadCartFromStorage() {
    try {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Verificar que sea un array válido
        if (Array.isArray(parsedCart)) {
          this.cartItems.next(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      localStorage.removeItem('cartItems');
    }
  }

  private saveFavoritesToStorage() {
    // Solo guardar si hay elementos en favoritos
    if (this.favoriteItems.value.length > 0) {
      localStorage.setItem('favoriteItems', JSON.stringify(this.favoriteItems.value));
    } else {
      localStorage.removeItem('favoriteItems');
    }
  }

  private loadFavoritesFromStorage() {
    try {
      const savedFavorites = localStorage.getItem('favoriteItems');
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        // Verificar que sea un array válido
        if (Array.isArray(parsedFavorites)) {
          this.favoriteItems.next(parsedFavorites);
        }
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      localStorage.removeItem('favoriteItems');
    }
  }

  // Notification Method
  private showNotification(message: string, isError: boolean = false) {
    const notification = document.createElement('div');
    const bgColor = isError ? 'bg-red-500' : 'bg-green-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }
}
