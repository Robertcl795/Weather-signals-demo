import { animate, style, transition, trigger } from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
]);

export const fadeInOutFast = trigger('fadeInOutFast', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('50ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [animate('50ms ease-in', style({ opacity: 0 }))]),
]);
