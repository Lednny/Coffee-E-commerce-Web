import { Routes } from '@angular/router';

export default [
    {
        path: 'login',
        loadComponent: () => import('../auth-log-in/auth-log-in')
    },
    {
        path: 'signup',
        loadComponent: () => import('../auth-sign-up/auth-sign-up')
    },
];