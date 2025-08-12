import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  // Transición de Login a Signup (deslizar hacia la izquierda)
  transition('LoginPage => SignupPage', [
    style({ position: 'relative', overflow: 'hidden' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ transform: 'translateX(100%)' })
    ], { optional: true }),
    query(':leave', [
      style({ transform: 'translateX(0%)' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(-100%)' }))
      ], { optional: true }),
      query(':enter', [
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(0%)' }))
      ], { optional: true })
    ])
  ]),
  
  // Transición de Signup a Login (deslizar hacia la derecha)
  transition('SignupPage => LoginPage', [
    style({ position: 'relative', overflow: 'hidden' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ transform: 'translateX(-100%)' })
    ], { optional: true }),
    query(':leave', [
      style({ transform: 'translateX(0%)' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(100%)' }))
      ], { optional: true }),
      query(':enter', [
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(0%)' }))
      ], { optional: true })
    ])
  ])
]);
