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
    {
        path: 'recetas',
        loadComponent: () => import('./features/Recetas/recetas').then(m => m.Recetas),
        data: { animation: 'RecetasPage' }
    },
    {
        path: 'nosotros',
        loadComponent: () => import('./features/Nosotros/nosotros').then(m => m.Nosotros),
        data: { animation: 'NosotrosPage' }
    },
    {
        path: 'contacto',
        loadComponent: () => import('./features/Contacto/contacto').then(m => m.Contacto),
        data: { animation: 'ContactoPage' }
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
    },
    {
        path: 'favorites',
        loadComponent: () => import('./features/favorites/favorites').then(m => m.Favorites),
        data: { animation: 'FavoritesPage' }
    },
    {
        path: 'orders',
        loadComponent: () => import('./features/orders/orders').then(m => m.Orders),
        data: { animation: 'OrdersPage' }
    },
    {
        path: 'configuration',
        loadComponent: () => import('./features/configuration/configuration').then(m => m.Configuration),
        data: { animation: 'ConfigurationPage' }
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
