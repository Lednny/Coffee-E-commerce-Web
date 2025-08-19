import { Component, OnInit, HostListener, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../features/auth/data-access/auth.service';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus: string = 'todos';
  scrollAnimateElements!: NodeListOf<Element>;
  isAuthenticated = false;
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
    // Simular carga de pedidos desde localStorage o API
    const savedOrders = localStorage.getItem('userOrders');
    if (savedOrders) {
      this.orders = JSON.parse(savedOrders);
    } else {
      // Datos de ejemplo
      this.orders = [
        {
          id: 'ORD-001',
          date: new Date('2025-08-15'),
          status: 'entregado',
          total: 89500,
          shippingAddress: 'Calle 123 #45-67, Bogotá',
          trackingNumber: 'TRK123456789',
          items: [
            {
              productId: 'g1',
              productName: 'CAFÉ COLOMBIANO PREMIUM',
              productImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
              quantity: 2,
              price: 32900,
              total: 65800
            },
            {
              productId: 'g2',
              productName: 'CAFÉ ARÁBICA ORGÁNICO',
              productImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
              quantity: 1,
              price: 23700,
              total: 23700
            }
          ]
        },
        {
          id: 'ORD-002',
          date: new Date('2025-08-18'),
          status: 'procesando',
          total: 45600,
          shippingAddress: 'Carrera 45 #12-34, Medellín',
          items: [
            {
              productId: 'm1',
              productName: 'MOLIDO ESPRESSO ITALIANO',
              productImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
              quantity: 2,
              price: 22800,
              total: 45600
            }
          ]
        }
      ];
    }
    
    this.filterOrders();
  }

  filterOrders() {
    if (this.selectedStatus === 'todos') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.selectedStatus);
    }
  }

  onStatusFilter(status: string) {
    this.selectedStatus = status;
    this.filterOrders();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'procesando':
        return 'bg-blue-100 text-blue-800';
      case 'enviado':
        return 'bg-purple-100 text-purple-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'procesando':
        return 'Procesando';
      case 'enviado':
        return 'Enviado';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  }

  reorderItems(order: Order) {
    // Aquí agregarías los productos del pedido al carrito
    alert(`Funcionalidad de re-ordenar para pedido ${order.id} (próximamente)`);
  }

  trackOrder(order: Order) {
    if (order.trackingNumber) {
      alert(`Número de seguimiento: ${order.trackingNumber}`);
    } else {
      alert('Este pedido aún no tiene número de seguimiento asignado.');
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
