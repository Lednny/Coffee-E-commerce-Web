import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BackendService } from '../../../core/services/backend.service';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    user: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _backendService = inject(BackendService);
    private _router = inject(Router);

    private _currentUser = new BehaviorSubject<any>(null);
    private _isAuthenticated = new BehaviorSubject<boolean>(false);

    public currentUser$ = this._currentUser.asObservable();
    public isAuthenticated$ = this._isAuthenticated.asObservable();

    constructor() {
        // Cargar usuario del storage al inicializar el servicio
        setTimeout(() => {
            this._loadUserFromStorage();
        }, 0);
    }

    // Obtener sesión actual
    getCurrentUser() {
        const currentUser = this._currentUser.value;

        // Si no hay usuario en memoria pero sí en localStorage y el token es válido
        if (!currentUser && this.isAuthenticated()) {
            const userStr = localStorage.getItem('current_user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    this._currentUser.next(user);
                    this._isAuthenticated.next(true);
                    return user;
                } catch {
                    // Si hay error, limpiar storage
                    this.signOut();
                }
            }
        }

        return currentUser;
    }

    // Verificar si está autenticado
    isAuthenticated(): boolean {
        const token = this._getToken();
        if (!token) {
            return false;
        }

        try {
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                return false;
            }

            const payload = JSON.parse(atob(tokenParts[1]));
            const isExpired = payload.exp < Date.now() / 1000;
            const isValid = !isExpired;

            console.log('Verificación de token:', {
                hasToken: true,
                isExpired,
                isValid,
                exp: payload.exp,
                now: Date.now() / 1000
            });

            return isValid;
        } catch (error) {
            console.error('Error al verificar token:', error);
            return false;
        }
    }

    // Registro
    signUp(credentials: RegisterCredentials): Observable<AuthResponse> {
        return this._backendService.register(credentials).pipe(
            tap(response => this._handleAuthSuccess(response))
        );
    }

    // Login
    logIn(credentials: LoginCredentials): Observable<AuthResponse> {
        return this._backendService.login(credentials).pipe(
            tap(response => this._handleAuthSuccess(response))
        );
    }

    // Logout
    async signOut(): Promise<void> {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        this._currentUser.next(null);
        this._isAuthenticated.next(false);
        await this._router.navigate(['/login']);
    }

    // Reset password
    resetPassword(email: string): Observable<any> {
        return this._backendService.resetPassword(email);
    }

    // Obtener token
    getToken(): string | null {
        return this._getToken();
    }

    // Métodos privados
    private _handleAuthSuccess(response: any): void {
        // Intentar diferentes estructuras de respuesta que pueden venir del backend
        let token: string | null = null;
        let user: any = null;

        // Caso 1: Respuesta directa con token y user
        if (response.token && response.user) {
            token = response.token;
            user = response.user;
        }
        // Caso 2: Respuesta con access_token
        else if (response.access_token && response.user) {
            token = response.access_token;
            user = response.user;
        }
        // Caso 3: Respuesta con accessToken
        else if (response.accessToken && response.user) {
            token = response.accessToken;
            user = response.user;
        }
        // Caso 4: Respuesta anidada con data
        else if (response.data && response.data.token && response.data.user) {
            token = response.data.token;
            user = response.data.user;
        }
        // Caso 5: Solo token, usuario incluido en el token
        else if (response.token || response.access_token || response.accessToken) {
            token = response.token || response.access_token || response.accessToken;
            // Intentar extraer usuario del token
            try {
                const tokenParts = token!.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    user = {
                        id: payload.sub || payload.id || payload.userId,
                        username: payload.username || payload.name || payload.user,
                        email: payload.email,
                        role: payload.role
                    };
                }
            } catch (error) {
                console.error('Error al decodificar token:', error);
            }
        }

        if (token && user) {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('current_user', JSON.stringify(user));
            this._currentUser.next(user);
            this._isAuthenticated.next(true);
        }
    }

    private _loadUserFromStorage(): void {
        const token = this._getToken();
        const userStr = localStorage.getItem('current_user');

        if (token && userStr) {
            try {
                // Verificar si el token no ha expirado
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    const isExpired = payload.exp < Date.now() / 1000;

                    if (!isExpired) {
                        const user = JSON.parse(userStr);
                        this._currentUser.next(user);
                        this._isAuthenticated.next(true);
                        return;
                    }
                }
                this._clearAuthData();
            } catch (error) {
                console.error('Error al cargar usuario del storage:', error);
                this._clearAuthData();
            }
        } else {
            // No hay token o usuario, asegurar estado inicial
            this._currentUser.next(null);
            this._isAuthenticated.next(false);
        }
    }

    private _clearAuthData(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        this._currentUser.next(null);
        this._isAuthenticated.next(false);
    }

    private _getToken(): string | null {
        return localStorage.getItem('auth_token');
    }
}
