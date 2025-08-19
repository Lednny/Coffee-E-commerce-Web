import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../../core/services/cart.service';

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

  constructor(private cartService: CartService) {}

  getCategoryName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'grano': 'EN GRANO',
      'molido': 'MOLIDO',
      'especial': 'ESPECIAL'
    };
    return categoryNames[category] || category.toUpperCase();
  }

  onViewMore() {
    this.viewMore.emit(this.product);
  }

  addToCart() {
    this.cartService.addToCart(this.product);
  }

  toggleFavorite() {
    this.cartService.toggleFavorite(this.product);
  }

  isInFavorites(): boolean {
    return this.cartService.isInFavorites(this.product.id);
  }
}
