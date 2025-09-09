import { Component, OnInit, HostListener, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { AuthService } from '../../features/auth/data-access/auth.service';
import { OrderService, OrderDTO, OrderItemDTO} from '../../core/services/order.service';
import { BackendService } from '../../core/services/backend.service';
import { Product } from '../../shared/models/product.model';
import { Navbar } from '../../core/components/navbar/navbar';


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
  private backendService = inject(BackendService);

  orders: OrderDTO[] = [];
  orderItems: OrderItemDTO[] = [];
  filteredOrders: OrderDTO[] = [];
  selectedStatus: string = 'todos';
  scrollAnimateElements!: NodeListOf<Element>;
  isAuthenticated = false;
  isLoading = false;
  private authSubscription?: Subscription;
  
  // Mapa para almacenar información completa de productos
  productCache: Map<number, Product> = new Map();

  ngOnInit() {
    // Verificar autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.loadOrders();
        } else {
          this.orders = [];
          this.filteredOrders = [];
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
    if (!this.isAuthenticated) {
      return;
    }
    
    this.isLoading = true;
    
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        console.log('Orders loaded:', orders?.length || 0);
        if (orders && orders.length > 0) {
          console.log('First order items:', orders[0].items);
          console.log('Sample item:', orders[0].items?.[0]);
        }
        this.orders = orders;
        this.loadProductDetails(orders);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.orders = [];
        this.filteredOrders = [];
        this.isLoading = false;
      }
    });
  }

  // Cargar detalles completos de productos para todas las órdenes
  loadProductDetails(orders: OrderDTO[]) {
    if (!orders || orders.length === 0) {
      this.filterOrders();
      this.isLoading = false;
      return;
    }

    // Recopilar todos los productIds únicos
    const productIds = new Set<number>();
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (item.productId && !this.productCache.has(item.productId)) {
          productIds.add(item.productId);
        }
      });
    });

    if (productIds.size === 0) {
      this.filterOrders();
      this.isLoading = false;
      return;
    }

    // Cargar información de productos en paralelo
    const productRequests = Array.from(productIds).map(id => 
      this.backendService.getProductById(id)
    );

    forkJoin(productRequests).subscribe({
      next: (products) => {
        // Guardar productos en cache
        products.forEach(product => {
          if (product && product.id) {
            this.productCache.set(product.id, product);
          }
        });
        
        this.filterOrders();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product details:', error);
        // Continuar sin detalles de producto
        this.filterOrders();
        this.isLoading = false;
      }
    });
  }

  filterOrders() {
    if (this.selectedStatus === 'todos') {
      this.filteredOrders = [...this.orders];
    } else {
      // Mapear los estados del frontend a los estados del backend
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

  // Helper methods para manejar valores undefined
  safeUnitPrice(item: OrderItemDTO): number {
    return item?.price || 0; // Usar 'price' en lugar de 'unitPrice'
  }

  safeSubtotal(item: OrderItemDTO): number {
    // Calcular subtotal si no está presente
    return item?.subtotal || (item?.price * item?.quantity) || 0;
  }

  safeQuantity(item: OrderItemDTO): number {
    return item?.quantity || 0;
  }

  safeProductName(item: OrderItemDTO): string {
    return item?.productName || 'Producto sin nombre';
  }

  // Método para obtener imagen del producto (placeholder por ahora)
  getProductImage(item: OrderItemDTO): string {
    const product = this.productCache.get(item.productId);
    return product?.imageUrl || '/assets/images/product-placeholder.png';
  }

  // Método para obtener descripción del producto
  getProductDescription(item: OrderItemDTO): string {
    const product = this.productCache.get(item.productId);
    return product?.description || item.productName || 'Sin descripción';
  }

  // Método para obtener categoría del producto
  getProductCategory(item: OrderItemDTO): string {
    const product = this.productCache.get(item.productId);
    return product?.category?.name || 'Sin categoría';
  }

  // Manejo de error de imagen
  onImageError(event: any) {
    if (event.target) {
      event.target.src = '/assets/images/product-placeholder.png';
    }
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
    console.log('Detalles de la orden:', {
      id: order.id,
      userOrderNumber: order.userOrderNumber,
      status: order.status,
      total: order.total,
      itemsCount: order.items?.length || 0,
      createdAt: order.createdAt,
      items: order.items
    });
    
    // Aquí puedes implementar un modal o navegación a página de detalles
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
