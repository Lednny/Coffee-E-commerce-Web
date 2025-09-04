import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../../features/auth/data-access/auth.service';
import { Product } from '../../shared/models/product.model';
import { AddressDTO } from '../../shared/models/address.interface';

@Injectable({ providedIn: 'root' })
export class BackendService {
    private _http = inject(HttpClient);
    private _baseUrl = environment.apiUrl;

    private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
        });
    }

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

    getProductPresentations(productId: number): Observable<{ [key: string]: number }> {
    return this._http.get<{ [key: string]: number }>(`${this._baseUrl}/products/${productId}/presentations`);
    }

    calculateProductPrice(productId: number, presentation?: string): Observable<number> {
        let httpParams = new HttpParams();
    if (presentation) {
        httpParams = httpParams.set('presentation', presentation);
    }
    
    return this._http.get<number>(`${this._baseUrl}/products/${productId}/calculate-price`, {
        params: httpParams
    });
}

getUserAddresses(): Observable<AddressDTO[]> {
    return this._http.get<AddressDTO[]>(`${this._baseUrl}/address/me`, {
        headers: this.getAuthHeaders()
    });
}

createAddress(address: AddressDTO): Observable<AddressDTO> {
    return this._http.post<AddressDTO>(`${this._baseUrl}/address`, address, {
        headers: this.getAuthHeaders()
    });
}

updateAddress(id: number, address: AddressDTO): Observable<AddressDTO> {
    return this._http.put<AddressDTO>(`${this._baseUrl}/address/${id}`, address, {
        headers: this.getAuthHeaders()
    });
}

deleteAddress(id: number): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/address/${id}`, {
        headers: this.getAuthHeaders()
    });
}

getAddressById(id: number): Observable<AddressDTO> {
    return this._http.get<AddressDTO>(`${this._baseUrl}/address/${id}`, {
        headers: this.getAuthHeaders()
    });
}

// Métodos para el perfil de usuario
getUserProfile(): Observable<any> {
    return this._http.get<any>(`${this._baseUrl}/users/profile`, {
        headers: this.getAuthHeaders()
    });
}

updateUserProfile(userData: any): Observable<any> {
    return this._http.put<any>(`${this._baseUrl}/users/profile`, userData, {
        headers: this.getAuthHeaders()
    });
}

// Métodos para preferencias de usuario
getUserPreferences(): Observable<any> {
    return this._http.get<any>(`${this._baseUrl}/users/preferences`, {
        headers: this.getAuthHeaders()
    });
}

updateUserPreferences(preferences: any): Observable<any> {
    return this._http.put<any>(`${this._baseUrl}/users/preferences`, preferences, {
        headers: this.getAuthHeaders()
    });
}

// Método para cambiar contraseña
changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this._http.put<any>(`${this._baseUrl}/users/change-password`, passwordData, {
        headers: this.getAuthHeaders()
    });
}
}