import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../../features/auth/data-access/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Product } from '../../shared/models/product.model';
import { BackendService } from '../../core/services/backend.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, ProductCard],
  templateUrl: './home.html',
})
export class Home implements OnInit, OnDestroy {
  private scrollAnimateElements: NodeListOf<HTMLElement> | null = null;

  // Productos destacados para mostrar en Home
  featuredProducts: Product[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private backendService: BackendService) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.initScrollAnimation();
  }

  ngOnDestroy(): void {
    // Limpiar listeners si es necesario
  }

  loadFeaturedProducts(): void {
    this.loading = true;
    this.error = null;
    
    this.backendService.getProducts().subscribe({
      next: (products) => {
        // Tomar los primeros 3 productos como destacados
        this.featuredProducts = products.slice(0, 3).map(product => ({
          ...product,
          inStock: product.stock > 0
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.error = 'Error al cargar productos destacados';
        this.loading = false;
      }
    });
  }

  // Animaciones de scroll
  private initScrollAnimation(): void {
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right');
      this.checkScrollAnimations();
    }, 100);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScrollAnimations();
  }

  private checkScrollAnimations(): void {
    if (!this.scrollAnimateElements) return;

    this.scrollAnimateElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animate-in');
      }
    });
  }
}
