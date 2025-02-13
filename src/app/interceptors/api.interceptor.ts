import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('openweathermap.org')) {
    const apiReq = req.clone({
      params: req.params.set('appid', environment.openWeatherApiKey)
    });
    return next(apiReq);
  }
  return next(req);
};