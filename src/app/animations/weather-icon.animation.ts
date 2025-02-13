import { animate, keyframes, style, transition, trigger } from "@angular/animations";

export const weatherIconAnimation = trigger('weatherIcon', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.8) rotate(-15deg)' }),
      animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
        style({ opacity: 1, transform: 'scale(1) rotate(0)' }))
    ]),
    transition(':leave', [
      animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
        style({ opacity: 0, transform: 'scale(0.8) rotate(15deg)' }))
    ]),
    transition('* => *', [
      animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', keyframes([
        style({ opacity: 0, transform: 'scale(0.8) rotate(-15deg)', offset: 0 }),
        style({ opacity: 0.5, transform: 'scale(1.1)', offset: 0.5 }),
        style({ opacity: 1, transform: 'scale(1) rotate(0)', offset: 1 })
      ]))
    ])
  ]);