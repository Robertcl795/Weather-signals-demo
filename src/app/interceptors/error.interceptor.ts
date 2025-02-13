import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../components/services/toast.service';

function getErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 401:
      return 'Invalid API key';
    case 404:
      return 'City not found';
    case 429:
      return 'Too many requests. Please try again later';
    default:
      return `Error: ${error.message}`;
  }
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      const errorMessage = getErrorMessage(error);
      toast.show({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    })
  );
};
