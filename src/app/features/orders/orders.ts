import { Component, OnInit, HostListener, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  private cdr = inject(ChangeDetectorRef);

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
          setTimeout(() => this.loadOrders(), 100);
        } else {
          this.orders = [];
          this.filteredOrders = [];
          this.isLoading = false;
        }
      }
    );

    // También verificar estado inicial SOLO si no se ha verificado ya
    const initialAuth = this.authService.isAuthenticated();
    
    if (initialAuth && this.orders.length === 0) {
      setTimeout(() => this.loadOrders(), 100);
    }
    
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate');
      this.checkScrollAnimations();
    }, 100);

    // Escuchar cambios de visibilidad para recargar cuando el usuario regrese
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    // Remover el listener de visibilidad
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  // Manejar cuando el usuario regresa a la pestaña
  handleVisibilityChange() {
    if (!document.hidden && this.isAuthenticated) {
      console.log('Usuario regresó a la pestaña, recargando órdenes...');
      this.loadOrders();
    }
  }

  loadOrders() {
    if (!this.isAuthenticated || this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders || [];
        this.loadProductDetails(orders || []);
      },
      error: (error) => {
        console.error('Error cargando órdenes:', error);
        this.orders = [];
        this.filteredOrders = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

    // Getter para verificar si no hay órdenes
    get hasNoOrders(): boolean {
    return this.orders.length === 0;
  }

  // Método para recargar manualmente
  refreshOrders() {
    this.orders = [];
    this.filteredOrders = [];
    this.productCache.clear(); // Limpiar cache de productos
    setTimeout(() => this.loadOrders(), 100);
  }


  // Cargar detalles completos de productos para todas las órdenes
  loadProductDetails(orders: OrderDTO[]) {
    console.log('=== loadProductDetails iniciado ===');
    console.log('Orders recibidas:', orders?.length || 0);
    
    if (!orders || orders.length === 0) {
      console.log('No hay órdenes, aplicando filtros y finalizando carga');
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

    console.log('ProductIds únicos encontrados:', Array.from(productIds));
    console.log('Productos en cache actual:', this.productCache.size);

    if (productIds.size === 0) {
      console.log('No hay productIds nuevos para cargar, aplicando filtros directamente');
      this.filterOrders();
      this.isLoading = false;
      console.log('isLoading establecido a false. filteredOrders final:', this.filteredOrders);
      this.cdr.detectChanges();
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
        console.log('Carga de productos completada. isLoading:', this.isLoading, 'filteredOrders:', this.filteredOrders);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading product details:', error);
        // Continuar sin detalles de producto
        this.filterOrders();
        this.isLoading = false;
        console.log('Error en carga de productos. isLoading:', this.isLoading, 'filteredOrders:', this.filteredOrders);
        this.cdr.detectChanges();
      }
    });
  }

  filterOrders() {
    if (this.selectedStatus === 'todos') {
      this.filteredOrders = [...this.orders];
    } else {
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
    
    this.cdr.detectChanges();
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
    // Usar una imagen simple o nada si no existe
    return product?.imageUrl || '';
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
      // Simplemente ocultar la imagen si falla
      event.target.style.display = 'none';
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
