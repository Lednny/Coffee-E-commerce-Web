import { Component, ElementRef, HostListener, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/data-access/auth.service';
import { CartService } from '../../services/cart.service';
import { Cart } from '../../../shared/models/cart.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('myCartDropdownButton1')
  myCartDropdownButton1!: ElementRef;
  @ViewChild("myCartDropdownButton1Btn")
  myCartDropdownButton1Btn!: ElementRef;
  @ViewChild('accountDropdownButton') 
  accountDropdownButton!: ElementRef;

  private _authService = inject(AuthService);
  private _cartService = inject(CartService);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  scrolled = false;
  isAuthenticated = false;
  currentUser: any = null;
  accountDropdownOpen = false;
  cartDropdownOpen = false;
  cart: Cart = { items: [] };
  cartItemsCount = 0;
  cartTotal = 0;
  private _subscription = new Subscription();

  ngOnInit() {
    // Suscribirse a los cambios de autenticación
    this._subscription.add(
      this._authService.isAuthenticated$.subscribe(
        isAuth => {
          this.isAuthenticated = isAuth;
          this._cdr.detectChanges(); // Forzar detección de cambios
        }
      )
    );

    this._subscription.add(
      this._authService.currentUser$.subscribe(
        user => {
          this.currentUser = user;
          this._cdr.detectChanges(); // Forzar detección de cambios
        }
      )
    );

    // Suscribirse a los cambios del carrito
    this._subscription.add(
      this._cartService.cartItems$.subscribe(
        (cart: Cart) => {
          console.log('Navbar recibió actualización del carrito:', cart);
          this.cart = cart;
          this.cartItemsCount = this._cartService.getCartItemsCount();
          this.cartTotal = this._cartService.getCartTotal();
          console.log('Navbar - Items count:', this.cartItemsCount, 'Total:', this.cartTotal);
          this._cdr.detectChanges();
        }
      )
    );
    
    // También obtener el estado inicial directamente
    this.isAuthenticated = this._authService.isAuthenticated();
    this.currentUser = this._authService.getCurrentUser();
    this.cart = { items: [] };
    this.cartItemsCount = 0;
    this.cartTotal = 0;
    
    // Verificar el estado después de un breve retraso para asegurar que los servicios se hayan inicializado
    setTimeout(() => {
      this.isAuthenticated = this._authService.isAuthenticated();
      this.currentUser = this._authService.getCurrentUser();
      this._cdr.detectChanges();
    }, 100);
  }

  ngAfterViewInit() {
    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Cerrar dropdown de cuenta
      if (this.accountDropdownButton && !this.accountDropdownButton.nativeElement.contains(target)) {
        this.accountDropdownOpen = false;
        this._cdr.detectChanges();
      }
      
      // Cerrar dropdown de carrito
      if (this.myCartDropdownButton1Btn && !this.myCartDropdownButton1Btn.nativeElement.contains(target)) {
        const cartDropdown = document.querySelector('.cart-dropdown');
        if (cartDropdown && !cartDropdown.contains(target)) {
          this.cartDropdownOpen = false;
          this._cdr.detectChanges();
        }
      }
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.pageYOffset > 50;
  }

  toggleAccountDropdown() {
    this.accountDropdownOpen = !this.accountDropdownOpen;
  }

  navigateToLogin() {
    this.accountDropdownOpen = false;
    this._router.navigate(['/auth/login']);
  }

  navigateToSignup() {
    this.accountDropdownOpen = false;
    this._router.navigate(['/auth/signup']);
  }

  navigateToProfile() {
    this.accountDropdownOpen = false;
    this._router.navigate(['/profile']);
  }

  navigateToFavorites() {
    this.accountDropdownOpen = false;
    this._router.navigate(['/favorites']);
  }

  navigateToConfiguration() {
    this.accountDropdownOpen = false;
    this._router.navigate(['/configuration']);
  }

  navigateToOrders(){
    this.accountDropdownOpen = false;
    this._router.navigate(['/orders']);
  }

  navigateToProducts() {
    this.accountDropdownOpen = false;
    this.cartDropdownOpen = false;
    this._router.navigate(['/products']);
  }


  async signOut() {
    this.accountDropdownOpen = false;
    await this._authService.signOut();
  }

  // Cart methods
  toggleCartDropdown() {
    this.cartDropdownOpen = !this.cartDropdownOpen;
  }

  removeFromCart(itemId: number) {
    this._cartService.removeFromCart(itemId);
  }

  updateQuantity(itemId: number, quantity: number) {
    this._cartService.updateQuantity(itemId, quantity);
  }

  clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this._cartService.clearCart();
    }
  }

  navigateToCart() {
    this.cartDropdownOpen = false;
    this._router.navigate(['/cart']);
  }

  getUserDisplayName(): string {
    if (this.isAuthenticated && this.currentUser) {
      // Priorizar username, luego id, luego email, luego nombre genérico
      const displayName = this.currentUser.username || 
                         this.currentUser.id ||           // Usar id como fallback
                         this.currentUser.name || 
                         this.currentUser.email?.split('@')[0] || 
                         'Usuario';
      return displayName;
    }
    return 'Account';
  }
}