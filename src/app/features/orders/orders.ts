import { Component, OnInit, HostListener, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../features/auth/data-access/auth.service';
import { OrderService, OrderDTO } from '../../core/services/order.service';
import { Navbar } from '../../core/components/navbar/navbar';
import { Footer } from '../../core/components/footer/footer';

export interface Order {
  id: string;
  date: Date;
  status: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  trackingNumber?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  
  orders: OrderDTO[] = [];
  filteredOrders: OrderDTO[] = [];
  selectedStatus: string = 'todos';
  scrollAnimateElements!: NodeListOf<Element>;
  isAuthenticated = false;
  isLoading = false;
  private authSubscription?: Subscription;

  ngOnInit() {
    // Verificar autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.loadOrders();
        }
      }
    );

    // También verificar estado inicial
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.loadOrders();
    }
    
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate');
      this.checkScrollAnimations();
    }, 100);
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadOrders() {
    if (!this.isAuthenticated) return;
    
    this.isLoading = true;
    
    // Usar el OrderService para obtener las órdenes del usuario
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filterOrders();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
        // Fallback a datos de ejemplo en caso de error
        this.loadSampleOrders();
      }
    });
  }

  loadSampleOrders() {
    // Datos de ejemplo que coinciden con OrderDTO
    this.orders = [
      {
        id: 1,
        userId: 'user123',
        userOrderNumber: 1001,
        firstProductName: 'Mesa de Comedor Premium',
        productsDescription: 'Mesa de comedor de madera + Sillas',
        createdAt: '2025-08-15T10:30:00Z',
        status: 'DELIVERED',
        total: 895000,
        payment: {
          id: 1,
          mount: 895000,
          urrency: 'COP',
          tatus: 'COMPLETED',
          stripePaymentIntentId: 'pi_test_123',
          createdAt: '2025-08-15T10:35:00Z'
        },
        items: [
          {
            id: 1,
            productId: 1,
            productName: 'Mesa de Comedor Premium',
            quantity: 1,
            unitPrice: 650000,
            subtotal: 650000
          },
          {
            id: 2,
            productId: 2,
            productName: 'Juego de 4 Sillas',
            quantity: 1,
            unitPrice: 245000,
            subtotal: 245000
          }
        ]
      },
      {
        id: 2,
        userId: 'user123',
        userOrderNumber: 1002,
        firstProductName: 'Sofá Moderno',
        productsDescription: 'Sofá de 3 puestos',
        createdAt: '2025-08-18T14:20:00Z',
        status: 'PROCESSING',
        total: 1250000,
        payment: {
          id: 2,
          mount: 1250000,
          urrency: 'COP',
          tatus: 'COMPLETED',
          stripePaymentIntentId: 'pi_test_456',
          createdAt: '2025-08-18T14:25:00Z'
        },
        items: [
          {
            id: 3,
            productId: 3,
            productName: 'Sofá Moderno 3 Puestos',
            quantity: 1,
            unitPrice: 1250000,
            subtotal: 1250000
          }
        ]
      }
    ];
    
    this.filterOrders();
  }

  filterOrders() {
    if (this.selectedStatus === 'todos') {
      this.filteredOrders = [...this.orders];
    } else {
      // Mapear los estados del OrderService a los estados locales
      const statusMap: { [key: string]: string } = {
        'pendiente': 'PENDING',
        'procesando': 'PROCESSING',
        'enviado': 'SHIPPED',
        'entregado': 'DELIVERED',
        'cancelado': 'CANCELLED'
      };
      
      const backendStatus = statusMap[this.selectedStatus];
      if (backendStatus) {
        this.filteredOrders = this.orders.filter(order => order.status === backendStatus);
      } else {
        this.filteredOrders = [...this.orders];
      }
    }
  }

  onStatusFilter(status: string) {
    this.selectedStatus = status;
    this.filterOrders();
  }

  getStatusColor(status: string): string {
    // Usar el método del OrderService para obtener colores consistentes
    const color = this.orderService.getOrderStatusColor(status);
    
    const colorMap: { [key: string]: string } = {
      'warning': 'bg-yellow-100 text-yellow-800',
      'info': 'bg-blue-100 text-blue-800',
      'primary': 'bg-purple-100 text-purple-800',
      'success': 'bg-green-100 text-green-800',
      'danger': 'bg-red-100 text-red-800',
      'secondary': 'bg-gray-100 text-gray-800'
    };
    
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    // Usar el método del OrderService para obtener texto en español
    return this.orderService.getOrderStatusInSpanish(status);
  }

  formatOrderDate(dateString: string): string {
    return this.orderService.formatOrderDate(dateString);
  }

  getOrderTotal(order: OrderDTO): number {
    return this.orderService.getOrderTotal(order);
  }

  getTotalItems(order: OrderDTO): number {
    return this.orderService.getTotalItems(order);
  }

  reorderItems(order: OrderDTO) {
    // Implementar funcionalidad de re-ordenar usando el OrderService
    if (confirm(`¿Quieres volver a pedir los productos del pedido #${order.userOrderNumber}?`)) {
      // Aquí podrías agregar los items al carrito o crear una nueva orden
      alert(`Funcionalidad de re-ordenar para pedido #${order.userOrderNumber} (próximamente)`);
    }
  }

  trackOrder(order: OrderDTO) {
    // Mostrar información de seguimiento
    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      alert(`Pedido #${order.userOrderNumber} - Estado: ${this.getStatusText(order.status)}\nCreado: ${this.formatOrderDate(order.createdAt)}`);
    } else {
      alert('Este pedido aún no tiene información de seguimiento disponible.');
    }
  }

  viewOrderDetails(order: OrderDTO) {
    // Implementar vista detallada de la orden
    console.log('Order details:', order);
    alert(`Ver detalles del pedido #${order.userOrderNumber} (próximamente)`);
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
