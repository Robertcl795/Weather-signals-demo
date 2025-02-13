import { Component, computed, input, output } from '@angular/core';
import {
  fadeInOut,
  shakeAnimation,
  weatherIconAnimation,
} from '../../animations';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { City, WeatherData } from '../../interfaces/weather.interface';
import { CommonModule } from '@angular/common';

@Component({
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule,
  ],
  animations: [fadeInOut, weatherIconAnimation, shakeAnimation],
  selector: 'app-city-card',
  templateUrl: 'card.component.html',
  styleUrl: 'card.component.scss',
})
export class CityCardComponent {
  public weatherData = input<WeatherData | undefined>(undefined);
  public loading = input<boolean>(false);
  public selected = input<boolean>(false);
  public errorMessage = input<string>('');

  public remove = output<void>();
  public retryLoad = output<void>();
  public select = output<City['id']>();

  public hasError = computed(() => Boolean(this.errorMessage()));
  public temperature = computed(() => this.weatherData()?.temperature ?? 0);
  public description = computed(() => this.weatherData()?.conditions ?? '');
  public timestamp = computed(
    () => this.weatherData()?.timestamp ?? new Date(),
  );

  public weatherIconUrl = computed(
    () =>
      `https://openweathermap.org/img/wn/${this.weatherData()?.icon}@2x.png`,
  );

  public handleSelect(): void {
    const weatherData = this.weatherData();
    if (weatherData !== undefined) {
      this.select.emit(weatherData.id);
    }
  }
}
