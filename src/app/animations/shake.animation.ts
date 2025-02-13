import { animate, keyframes, style, transition, trigger } from "@angular/animations";

export const shakeAnimation = trigger('shake', [
    transition('* => true', [
      animate('400ms ease-in-out', keyframes([
        style({ transform: 'translateX(0)', offset: 0 }),
        style({ transform: 'translateX(-10px)', offset: 0.2 }),
        style({ transform: 'translateX(10px)', offset: 0.4 }),
        style({ transform: 'translateX(-10px)', offset: 0.6 }),
        style({ transform: 'translateX(10px)', offset: 0.8 }),
        style({ transform: 'translateX(0)', offset: 1 })
      ]))
    ])
  ]);