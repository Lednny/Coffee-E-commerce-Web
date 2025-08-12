import { Routes } from '@angular/router';
import { privateGuard, publicGuard } from './core/services/guards/auth.guards';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',  
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./features/home/home').then(m => m.Home),
        data: { animation: 'HomePage' }
        // Sin guard - público para e-commerce
    },
    {
        path: 'products',
        loadComponent: () => import('./features/products/products').then(m => m.Products),
        data: { animation: 'ProductsPage' }
    },
    
    // Rutas de autenticación
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./features/auth/features/auth-log-in/auth-log-in').then(m => m.AuthLogIn),
                canActivate: [publicGuard],
                data: { hideNavbarFooter: true, animation: 'LoginPage' }
            },
            {
                path: 'signup',
                loadComponent: () => import('./features/auth/features/auth-sign-up/auth-sign-up').then(m => m.AuthSignUp),
                canActivate: [publicGuard],
                data: { hideNavbarFooter: true, animation: 'SignupPage' }
            }
        ]
    },
    
    // Rutas protegidas
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile),
        canActivate: [privateGuard]
    },
    
    // Otras rutas protegidas para e-commerce
    {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart').then(m => m.Cart),
        data: { animation: 'CartPage' }
    }
    
    // Comentado hasta que existan los módulos
    /* 
    {
        path: 'cart/checkout',
        loadComponent: () => import('./features/cart/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [privateGuard] // Solo si está logueado
    },
    {
        path: 'orders',
        loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent),
        canActivate: [privateGuard] // Solo si está logueado
    }
    */
];
