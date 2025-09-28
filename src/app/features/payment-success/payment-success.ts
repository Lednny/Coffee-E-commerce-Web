import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { StripeService } from '../../core/services/stripe.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.css']
})
export class PaymentSuccess implements OnInit {
  isVerifying = true;
  paymentVerified = false;
  sessionId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private stripeService: StripeService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Obtener el session_id de los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'];
      if (this.sessionId) {
        this.verifyPayment();
      } else {
        this.isVerifying = false;
        // Si no hay session_id, redirigir al home después de 3 segundos
        setTimeout(() => {
          this.goToHome();
        }, 100000);
      }
    });
  }

verifyPayment() {
  if (!this.sessionId) return;

  // Agregar un pequeño delay para que el webhook procese
  setTimeout(() => {
    this.attemptVerifyPayment(0); // Comenzar con intento 0
  }, 1000); // Esperar 1 segundo
}

private attemptVerifyPayment(attempt: number) {
  const maxAttempts = 3;

  this.stripeService.verifyPayment(this.sessionId!).subscribe({
    next: (result: any) => {
      if (result.success) {
        this.paymentVerified = true;
        this.isVerifying = false;

        // El webhook ya limpió el carrito, solo refrescar estado local
        this.cartService.refreshCart();

        // Limpiar datos del localStorage
        localStorage.removeItem('pendingOrderId');

      } else if (attempt < maxAttempts - 1) {
        // Si falló pero aún hay intentos, esperar y reintentar
        setTimeout(() => {
          this.attemptVerifyPayment(attempt + 1);
        }, 2000);

      } else {
        // Se acabaron los intentos
        this.isVerifying = false;
        this.paymentVerified = false;
      }
    },
    error: (error) => {
      console.error('Error en intento', attempt + 1, ':', error);

      if (attempt < maxAttempts - 1) {
        // Reintentar si hay intentos disponibles
        setTimeout(() => {
          this.attemptVerifyPayment(attempt + 1);
        }, 2000);
      } else {
        this.isVerifying = false;
        this.paymentVerified = false;
      }
    }
  });
}

  goToHome() {
    this.router.navigate(['/']);
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }
}
