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
  styleUrl: './payment-success.css'
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
        }, 3000);
      }
    });
  }

  verifyPayment() {
    if (!this.sessionId) return;

    this.stripeService.verifyPayment(this.sessionId).subscribe({
      next: (result) => {
        console.log('Pago verificado:', result);
        this.paymentVerified = true;
        this.isVerifying = false;
        
        // Limpiar el carrito después del pago exitoso
        this.cartService.clearCart();
        
        // Limpiar datos del localStorage
        localStorage.removeItem('pendingOrderId');
        
        // Redirigir al home después de 5 segundos
        setTimeout(() => {
          this.goToHome();
        }, 5000);
      },
      error: (error) => {
        console.error('Error verificando pago:', error);
        this.isVerifying = false;
        this.paymentVerified = false;
        
        // Redirigir al home después de 3 segundos
        setTimeout(() => {
          this.goToHome();
        }, 3000);
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
