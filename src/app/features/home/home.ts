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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, ProductCard],
  templateUrl: './home.html',
})
export class Home implements OnInit, OnDestroy {
  private scrollAnimateElements: NodeListOf<HTMLElement> | null = null;

  // Productos de ejemplo para mostrar en Home
  featuredProducts: Product[] = [
    {
      id: '1',
      name: 'CAFÉ COLOMBIA SUPREMO',
      description: 'Tostado medio, notas de chocolate negro y caramelo dulce',
      price: 24900,
      originalPrice: 29900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'grano',
      inStock: true,
      isOnSale: true,
      salePercentage: 15,
      rating: 4.5,
      reviewCount: 128,
      origin: 'Colombia',
      weight: '500g',
      roastLevel: 'medio',
      tags: ['Orgánico', 'Fair Trade']
    },
    {
      id: '2',
      name: 'CAFÉ BRASIL SANTOS',
      description: 'Tostado suave, notas florales y cítricas',
      price: 22900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'molido',
      inStock: true,
      rating: 4.2,
      reviewCount: 87,
      origin: 'Brasil',
      weight: '250g',
      roastLevel: 'claro',
      tags: ['Suave', 'Aromático']
    },
    {
      id: '3',
      name: 'CAFÉ ETIOPÍA YIRGACHEFFE',
      description: '100% orgánico, tostado artesanal, perfil complejo',
      price: 32900,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'especial',
      inStock: true,
      rating: 4.8,
      reviewCount: 203,
      origin: 'Etiopía',
      weight: '250g',
      roastLevel: 'claro',
      tags: ['Orgánico', 'Single Origin', 'Floral']
    }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right');
      this.checkScrollAnimations();
    }, 100);
  }

  ngOnDestroy() {
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScrollAnimations();
  }

  private checkScrollAnimations() {
    if (!this.scrollAnimateElements) return;

    this.scrollAnimateElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animate-in');
      }
    });
  }

  logOut() {
    this.authService.signOut();
  }
}
