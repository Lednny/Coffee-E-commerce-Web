import { Routes } from '@angular/router';
import { privateGuard, publicGuard } from './core/services/guards/auth.guards';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',  // E-commerce: redirige a home, no a login
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
        // Sin guard - público para e-commerce
    },
    // Rutas de autenticación - solo accesibles si NO está logueado
    // Comentado hasta que exista el módulo auth
    /*
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
        canActivate: [publicGuard] // Solo si NO está logueado
    },
    */
    
    // Ejemplo de rutas protegidas para e-commerce (agregar cuando existan)
    /* 
    {
        path: 'cart/checkout',
        loadComponent: () => import('./features/cart/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [privateGuard] // Solo si está logueado
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [privateGuard] // Solo si está logueado
    },
    {
        path: 'orders',
        loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent),
        canActivate: [privateGuard] // Solo si está logueado
    }
    */
];
