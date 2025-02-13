import { Component, computed, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
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
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatProgressSpinnerModule, CommonModule],
  animations: [fadeInOut, weatherIconAnimation, shakeAnimation],
  selector: 'city-card',
  templateUrl: 'card.component.html',
  styleUrl: 'card.component.scss'
})
export class CityCardComponent {
  @Input() weatherData?: WeatherData;
  @Input() loading = false;
  @Input() selected = false;
  @Output() remove = new EventEmitter<void>();
  @Output() retryLoad = new EventEmitter<void>();
  @Output() select = new EventEmitter<City>();

  public errorMessage = signal<string>('');
  public hasError = computed(() => Boolean(this.error));

  @Input() set error(value: string | undefined) {
    this.errorMessage.set(value || '');
  }


  public temperature = computed(() => this.weatherData?.temperature ?? 0);
  public description = computed(() => this.weatherData?.conditions ?? '');
  public timestamp = computed(() => this.weatherData?.timestamp ?? new Date());

  public weatherIconUrl = computed(
    () => `https://openweathermap.org/img/wn/${this.weatherData?.icon}@2x.png`
  );
}
