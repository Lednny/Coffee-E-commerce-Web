import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../../features/auth/data-access/auth.service';
import { Product } from '../../shared/models/product.model';

@Injectable({ providedIn: 'root' })
export class BackendService {
    private _http = inject(HttpClient);
    private _baseUrl = environment.apiUrl;

    // Métodos de autenticación
    login(credentials: LoginCredentials): Observable<AuthResponse> {
        return this._http.post<AuthResponse>(`${this._baseUrl}/auth/login`, credentials);
    }

    register(userData: RegisterCredentials): Observable<AuthResponse> {
        return this._http.post<AuthResponse>(`${this._baseUrl}/auth/register`, userData);
    }

    resetPassword(email: string): Observable<any> {
        return this._http.post<any>(`${this._baseUrl}/auth/reset-password`, { email });
    }

    // Métodos para productos
    getProducts(): Observable<Product[]> {
        return this._http.get<Product[]>(`${this._baseUrl}/products`);
    }

    getProductById(id: number): Observable<Product> {
        return this._http.get<Product>(`${this._baseUrl}/products/${id}`);
    }

    getProductsByCategory(categoryId: number): Observable<Product[]> {
        return this._http.get<Product[]>(`${this._baseUrl}/products/category/${categoryId}`);
    }

    // Métodos para categorías
    getCategories(): Observable<any[]> {
        return this._http.get<any[]>(`${this._baseUrl}/category`);
    }

    getCategoryById(id: number): Observable<any> {
        return this._http.get<any>(`${this._baseUrl}/category/${id}`);
    }
}