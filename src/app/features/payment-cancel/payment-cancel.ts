import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-cancel.html',
  styleUrl: './payment-cancel.css'
})
export class PaymentCancel implements OnInit {
  countdown = 5;

  constructor(private router: Router) {}

  ngOnInit() {
    // Iniciar cuenta regresiva para redirigir automáticamente
    this.startCountdown();
  }

  startCountdown() {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.goToCart();
      }
    }, 1000);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }
}
