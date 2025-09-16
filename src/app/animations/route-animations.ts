import { trigger, transition, style, animate } from '@angular/animations';

export const slideInAnimation = trigger('slideInAnimation', [
  // Transición de Login a Signup (deslizar hacia la derecha)
  transition('login => signup', [
    style({ transform: 'translateX(0%)' }),
    animate('400ms ease-in-out', style({ transform: 'translateX(-100%)' }))
  ]),
  
  // Transición de Signup a Login (deslizar hacia la izquierda)  
  transition('signup => login', [
    style({ transform: 'translateX(0%)' }),
    animate('400ms ease-in-out', style({ transform: 'translateX(100%)' }))
  ]),

  // Fade por defecto para otras transiciones
  transition('* => *', [
    style({ opacity: 1 }),
    animate('200ms ease-in-out', style({ opacity: 0.6 })),
    animate('200ms ease-in-out', style({ opacity: 1 }))
  ])
]);
