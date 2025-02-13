import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SearchBarComponent } from './components/search/search.component';
import { City } from './interfaces/weather.interface';
import { CityForecastComponent } from './components/forecast/forecast.component';
import { CityCardComponent } from './components/card/card.component';
import { CommonModule } from '@angular/common';
import { WeatherStateService } from './services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    SearchBarComponent,
    CityForecastComponent,
    CityCardComponent,
  ],
})
export class AppComponent {
  title = 'weather-forecast-demo';

  private weatherState = inject(WeatherStateService);
  protected selectedCities = this.weatherState.selectedCities;
  protected cityWeatherMap = this.weatherState.cityWeatherMap;
  protected loadingStates = this.weatherState.loadingStates;
  protected currentCity = this.weatherState.currentCity;
  protected forecastDays = this.weatherState.forecastDays;
  protected citySuggestions = this.weatherState.citySuggestions;
  protected errors = this.weatherState.errors;
  protected isForecastLoading = this.weatherState.isForecastLoading;

  protected currentWeatherData = computed(() => {
    const city = this.currentCity();
    return city ? this.cityWeatherMap().get(city.id) : undefined;
  });
  protected handleSearchChange(term: string): void {
    this.weatherState.searchCities(term);
  }

  protected handleCitySelect(city: City): void {
    this.weatherState.addCity(city);
  }

  protected handleCityRemove(city: City): void {
    this.weatherState.deleteCity(city);
  }

  protected handleCardClick(city: City): void {
    this.weatherState.selectCity(city);
  }
}
