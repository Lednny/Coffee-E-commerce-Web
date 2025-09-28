import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-cancel.html',
  styleUrl: './payment-cancel.css'
})
export class PaymentCancel implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  countdown = 60;
  orderId: string | null = null;
  sessionId: string | null = null;
  loading = false;
  private countdownInterval: any;

  ngOnInit() {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.orderId = params['order_id'] || null;
      this.sessionId = params['session_id'] || null;
          });

    // Iniciar cuenta regresiva para redirigir automáticamente
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
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

  cancelCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
