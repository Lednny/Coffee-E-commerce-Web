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
        this._loadUserFromStorage();
    }

    // Obtener sesión actual
    getCurrentUser() {
        return this._currentUser.value;
    }

    // Verificar si está autenticado
    isAuthenticated(): boolean {
        const token = this._getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp < Date.now() / 1000;
            return !isExpired;
        } catch {
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
    private _handleAuthSuccess(response: AuthResponse): void {
        if (response.token && response.user) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('current_user', JSON.stringify(response.user));
            this._currentUser.next(response.user);
            this._isAuthenticated.next(true);
        }
    }

    private _loadUserFromStorage(): void {
        const token = this._getToken();
        const userStr = localStorage.getItem('current_user');

        if (token && userStr && this.isAuthenticated()) {
            try {
                const user = JSON.parse(userStr);
                this._currentUser.next(user);
                this._isAuthenticated.next(true);
            } catch {
                this.signOut();
            }
        }
    }

    private _getToken(): string | null {
        return localStorage.getItem('auth_token');
    }
}