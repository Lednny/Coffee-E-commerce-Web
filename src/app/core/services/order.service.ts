import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface OrderItemDTO {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number; // El backend envía 'price' no 'unitPrice'
    subtotal?: number; // Puede no estar presente
    // Campos adicionales que podríamos necesitar
    productDescription?: string;
    productImageUrl?: string;
    productCategory?: string;
}

export interface PaymentDTO{
    id: number;
    mount: number;
    urrency: string;
    tatus: string;
    stripePaymentIntentId: string;
    createdAt: string;
}

export interface OrderDTO {
    id: number;
    userId: string;
    items: OrderItemDTO[];
    createdAt: string;
    total: number;
    status: string;
    payment: PaymentDTO;
    userOrderNumber: number;
    firstProductName: string;
    productsDescription: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'http://localhost:8080/api/orders';

    constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

    // Crear orden desde el carrito
    createOrder(addressId: number): Observable<OrderDTO> {
        const params = new HttpParams()
            .set('addressId', addressId.toString());

        return this.http.post<OrderDTO>(`${this.apiUrl}/create`, null, {
            headers: this.getAuthHeaders(),
            params: params
        });
    }

  // Crear orden y obtener checkout URL (si implementas el endpoint combinado)
  createOrderAndCheckout(addressId: number): Observable<{
    orderId: number;
    checkoutUrl: string;
    sessionId: string;
    order: OrderDTO;
  }> {
const params = new HttpParams().set('addressId', addressId.toString());
return this.http.post<any>(`${this.apiUrl}/checkout`, {}, {
    headers: this.getAuthHeaders(),
    params: params
});
  }

  // Obtener órdenes del usuario
  getUserOrders(): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(orders => {
        console.log('Orders loaded:', orders?.length || 0);
      }),
      catchError(error => {
        console.error('Error loading orders:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener orden por ID
  getOrderById(orderId: number): Observable<OrderDTO> {
    return this.http.get<OrderDTO>(`${this.apiUrl}/${orderId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Confirmar pago (si implementas este endpoint)
  confirmPayment(orderId: number, paymentIntentId: string): Observable<OrderDTO> {
    return this.http.put<OrderDTO>(`${this.apiUrl}/${orderId}/confirm-payment`, {
      paymentIntentId: paymentIntentId
    }, {
      headers: this.getAuthHeaders()
    });
  }

  // Obtener total de la orden
  getOrderTotal(order: OrderDTO): number {
    return order.total; 
  }

  // Obtener cantidad total de items
  getTotalItems(order: OrderDTO): number {
    return order.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  // Formatear fecha de la orden
  formatOrderDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtener estado de la orden en español
  getOrderStatusInSpanish(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmado',
      'PROCESSING': 'Procesando',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  // Obtener color del estado para UI
  getOrderStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'warning',
      'CONFIRMED': 'info',
      'PROCESSING': 'primary',
      'SHIPPED': 'success',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    return colorMap[status] || 'secondary';
  }
}
