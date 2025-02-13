import {
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import {
  fadeInOutFast,
  listAnimation,
  shakeAnimation,
  weatherIconAnimation,
} from '../../animations';
import {
  City,
  ForecastDay,
  WeatherData,
} from '../../interfaces/weather.interface';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule,
  ],
  animations: [
    fadeInOutFast,
    listAnimation,
    weatherIconAnimation,
    shakeAnimation,
  ],
  selector: 'city-forecast',
  templateUrl: 'forecast.component.html',styleUrl: 'forecast.component.scss'
})
export class CityForecastComponent {
  @Input() set city(value: City | null) {
    this.selectedCity.set(value);
  }
  @Input() set isLoading(value: boolean) {
    this.loading.set(value);
  }
  @Input() set weatherData(value: WeatherData | null) {
    this.currentWeather.set(value);
  }
  @Input() set forecast(value: ForecastDay[]) {
    this.forecastDays.set(value);
  }

  @Input() set error(value: string | undefined) {
    this.errorMessage.set(value || '');
  }
  @Output() retryLoad = new EventEmitter<void>();

  // Error handling signal
  public errorMessage = signal<string>('');
  public hasError = computed(() => Boolean(this.errorMessage()));

  // State signals
  public selectedCity = signal<City | null>(null);
  public loading = signal(false);
  public currentWeather = signal<WeatherData | null>(null);
  public forecastDays = signal<ForecastDay[]>([]);

  // Computed signals
  public currentTemperature = computed(
    () => this.currentWeather()?.temperature ?? 0
  );

  public currentDescription = computed(
    () => this.currentWeather()?.conditions ?? ''
  );

  public currentWeatherIcon = computed(
    () =>
      `https://openweathermap.org/img/wn/${this.currentWeather()?.icon}@2x.png`
  );

  protected trackForecastDay(day: ForecastDay) {
    return `${this.city!.id}-${day.day}`;
  }
}
