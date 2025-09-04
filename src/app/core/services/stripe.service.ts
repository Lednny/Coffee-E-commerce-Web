import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheckoutSession {
    checkoutUrl: string;
    sessionId: string;
}

@Injectable({
    providedIn: 'root'
})
export class StripeService {
    private apiUrl = 'http://localhost:8080/api/stripe';

    constructor(private http: HttpClient) {}

  // Crear sesión de checkout
createCheckoutSession(orderId: number): Observable<CheckoutSession> {
    // URLs de redirección
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/payment-cancel`;
    
    const params = new HttpParams()
        .set('orderId', orderId.toString())
        .set('successUrl', successUrl)
        .set('cancelUrl', cancelUrl);
    
    return this.http.post<CheckoutSession>(`${this.apiUrl}/checkout-session`, {}, {
        params: params
    });
}

  // Verificar estado del pago
        verifyPayment(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-payment/${sessionId}`);
    }
}