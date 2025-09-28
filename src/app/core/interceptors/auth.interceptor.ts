import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Agregar token a todas las requests si existe
    const token = localStorage.getItem('auth_token');

    let authReq = req;
    if (token && this.isTokenValid(token)) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.clearAuthData();

          // Solo redirigir al login si no estamos en páginas públicas
          const currentUrl = this.router.url;
          const publicRoutes = ['/', '/home', '/products', '/nosotros', '/contacto', '/recetas'];

          if (!publicRoutes.includes(currentUrl) && !currentUrl.includes('/login') && !currentUrl.includes('/register')) {
            this.router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }

  private isTokenValid(token: string): boolean {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return false;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const isExpired = payload.exp < Date.now() / 1000;

      if (isExpired) {
        this.clearAuthData();
        return false;
      }

      return true;
    } catch (error) {
      this.clearAuthData();
      return false;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }
}
