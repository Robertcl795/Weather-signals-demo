import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive' | 'primary';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _snackBar = inject(MatSnackBar);
  show(options: ToastOptions): void {
    this._snackBar.open(options.description, options.title, {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
