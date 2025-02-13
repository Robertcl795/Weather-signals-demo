import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, retry, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AirQuality,
  City,
  CurrentWeatherResponse,
  ForecastDay,
  ForecastResponse,
  WeatherData,
  WeatherResponse,
} from '../../interfaces/weather.interface';
import { CacheService } from './cache.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);
  private toast = inject(ToastService);
  private readonly API_KEY = environment.openWeatherApiKey;
  private readonly WEATHER_API = 'https://api.openweathermap.org/data/2.5';
  private readonly GEOCODING_API = 'https://api.openweathermap.org/geo/1.0';

  searchCities(query: string): Observable<City[]> {
    if (!query || query.length < 3) {
      return of([]);
    }

    return this.http
      .get<City[]>(
        `${this.GEOCODING_API}/direct?q=${query}&limit=5&appid=${this.API_KEY}`
      )
      .pipe(
        map((response) => this.mapCities(response)),
        retry(2),
        catchError(this.handleError)
      );
  }

  getWeatherData(city: City): Observable<WeatherData> {
    const cacheKey = `weather-${city.lat}-${city.lon}`;
    const cachedData = this.cache.get(cacheKey);

    if (cachedData) {
      return of(cachedData);
    }

    return this.http
      .get<CurrentWeatherResponse>(
        `${this.WEATHER_API}/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${this.API_KEY}`
      )
      .pipe(
        map((response) => this.mapCurrentWeatherData(response, city.name)),
        tap((data) => this.cache.set(cacheKey, data)),
        retry(2),
        catchError(this.handleError)
      );
  }

  getForecast(city: City): Observable<ForecastDay[]> {
    return this.http
      .get<ForecastResponse>(
        `${this.WEATHER_API}/forecast?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${this.API_KEY}`
      )
      .pipe(
        map((response) => this.mapForecastData(response)),
        retry(2),
        catchError(this.handleError)
      );
  }

  getAirQuality(city: City): Observable<AirQuality> {
    const cacheKey = `air-${city.lat}-${city.lon}`;
    const cachedData = this.cache.get(cacheKey);

    if (cachedData) {
      return of(cachedData);
    }

    return this.http
      .get<any>(
        `${this.WEATHER_API}/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${this.API_KEY}`
      )
      .pipe(
        map((response) => response.list[0].main),
        tap((data) => {
          this.cache.set(cacheKey, data);
          this.notifyAirQuality(data, city.name);
        }),
        retry(2),
        catchError(this.handleError)
      );
  }

  private mapCities(response: any[]): City[] {
    return response.map((item) => ({
      name: item.name,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
      id: `${item.name}-${item.lat.toFixed(4)}-${item.lon.toFixed(4)}-${
        item.country
      }`,
    }));
  }

  private mapCurrentWeatherData(
    response: CurrentWeatherResponse,
    cityName: string
  ): WeatherData {
    return {
      city: cityName,
      temperature: Math.round(response.main.temp),
      conditions: response.weather[0].description,
      icon: response.weather[0].icon,
      timestamp: new Date(),
    };
  }

  private mapForecastData(response: ForecastResponse): ForecastDay[] {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyForecasts = new Map<string, ForecastDay>();

    // Group forecasts by day and calculate average temperature
    response.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().split('T')[0];

      if (!dailyForecasts.has(dayKey)) {
        dailyForecasts.set(dayKey, {
          day: days[date.getDay()],
          temperature: item.main.temp,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
          tempSum: item.main.temp,
          count: 1,
        });
      } else {
        const existing = dailyForecasts.get(dayKey)!;
        existing.tempSum! += item.main.temp;
        existing.count! += 1;
        existing.temperature = Math.round(existing.tempSum! / existing.count!);
      }
    });

    // Convert to array and clean up temporary properties
    return Array.from(dailyForecasts.values())
      .slice(0, 4) // Get next 4 days
      .map(({ day, temperature, icon, description }) => ({
        day,
        temperature: Math.round(temperature),
        icon,
        description,
      }));
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      switch (error.status) {
        case 404:
          errorMessage = 'City not found';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later';
          break;
        case 401:
          errorMessage = 'Invalid API key';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    return throwError(() => errorMessage);
  }

  private notifyAirQuality(data: AirQuality, cityName: string): void {
    const aqi = data.aqi;
    let message = `Air quality in ${cityName}: `;
    let variant: 'primary' | 'destructive' = 'primary';

    switch (aqi) {
      case 1:
        message += 'Good';
        break;
      case 2:
        message += 'Fair';
        break;
      case 3:
        message += 'Moderate';
        variant = 'destructive';
        break;
      case 4:
        message += 'Poor';
        variant = 'destructive';
        break;
      case 5:
        message += 'Very Poor';
        variant = 'destructive';
        break;
    }

    this.toast.show({
      title: 'Air Quality Alert',
      description: message,
      variant,
    });
  }
}
