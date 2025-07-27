import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../features/auth/data-access/auth.service';


//Guard para rutas que requieren autenticación Uso: checkout, perfil, pedidos, favoritos

export const privateGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Guarda la URL actual para redirigir después del login
    const currentUrl = router.url;
    router.navigate(['/auth/login'], {
        queryParams: { returnUrl: currentUrl }
    });
    return false;
};

// Guard para rutas de autenticación (login, register) Evita que usuarios logueados vean estas páginas

export const publicGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (!authService.isAuthenticated()) {
        return true;
    }

    // Si ya está logueado, redirige a home
    router.navigate(['/home']);
    return false;
};
