import {
  booleanAttribute,
  Component,
  computed,
  input,
  output,
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
  selector: 'app-city-forecast',
  templateUrl: 'forecast.component.html',
  styleUrl: 'forecast.component.scss',
})
export class CityForecastComponent {
  //* Inputs and Outputs *//
  public city = input<City | undefined>(undefined);
  public isLoading = input(false, { transform: booleanAttribute });
  public weatherData = input<WeatherData | undefined>(undefined);
  public forecast = input<ForecastDay[]>([]);
  public error = input<string | undefined>(undefined);
  public retryLoad = output();

  //* Computed Values *//
  public currentDescription = computed(
    () => this.weatherData()?.conditions ?? '',
  );
  public currentTemperature = computed(
    () => this.weatherData()?.temperature ?? 0,
  );
  public currentWeatherIcon = computed(
    () =>
      `https://openweathermap.org/img/wn/${this.weatherData()?.icon}@2x.png`,
  );
  public forecastDays = computed(() => this.forecast());
  public hasError = computed(() => Boolean(this.error()));

  protected trackForecastDay(_index: number, day: ForecastDay) {
    return `${this.city()?.id}-${_index}.${day.day}`;
  }
}
