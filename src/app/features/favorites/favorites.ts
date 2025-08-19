import { Component, OnInit, HostListener, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Product } from '../../shared/models/product.model';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCard],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class Favorites implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  
  favoriteProducts: Product[] = [];
  scrollAnimateElements!: NodeListOf<Element>;
  private favoritesSubscription?: Subscription;

  ngOnInit() {
    // Suscribirse a los favoritos del servicio
    this.favoritesSubscription = this.cartService.favoriteItems$.subscribe(
      favorites => this.favoriteProducts = favorites
    );
    
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate');
      this.checkScrollAnimations();
    }, 100);
  }

  ngOnDestroy() {
    if (this.favoritesSubscription) {
      this.favoritesSubscription.unsubscribe();
    }
  }

  removeFromFavorites(product: Product) {
    this.cartService.removeFromFavorites(product.id);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  clearAllFavorites() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los productos de favoritos?')) {
      this.cartService.clearFavorites();
    }
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.checkScrollAnimations();
  }

  checkScrollAnimations() {
    if (!this.scrollAnimateElements) return;

    this.scrollAnimateElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animate-visible');
      }
    });
  }
}
