import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WeatherService } from './weather.service';
import {
  City,
  ForecastDay,
  WeatherData,
} from '../interfaces/weather.interface';

@Injectable({
  providedIn: 'root',
})
export class WeatherStateService {
  private weatherService = inject(WeatherService);

  // Private signals for internal state management
  private selectedCitiesSignal = signal<City[]>([]);
  private cityWeatherMapSignal = signal<Map<string, WeatherData>>(new Map()); // Changed to number for ID
  private loadingStatesSignal = signal<Map<string, boolean>>(new Map()); // Changed to number for ID
  private currentCitySignal = signal<City | undefined>(undefined);
  private forecastDaysSignal = signal<ForecastDay[]>([]);
  private citySuggestionsSignal = signal<City[]>([]);
  private errorsSignal = signal<Map<string, string>>(new Map()); // Changed to number for ID
  private isForecastLoadingSignal = signal<boolean>(false);

  // Public computed signals for components
  public selectedCities = computed(() => this.selectedCitiesSignal());
  public cityWeatherMap = computed(() => this.cityWeatherMapSignal());
  public loadingStates = computed(() => this.loadingStatesSignal());
  public currentCity = computed(() => this.currentCitySignal());
  public forecastDays = computed(() => this.forecastDaysSignal());
  public citySuggestions = computed(() => {
    const selectedCityIds = new Set(
      this.selectedCitiesSignal().map((city) => city.id),
    );
    return this.citySuggestionsSignal().filter(
      (city) => !selectedCityIds.has(city.id),
    );
  });
  public errors = computed(() => this.errorsSignal());
  public isForecastLoading = computed(() => this.isForecastLoadingSignal());

  constructor() {
    effect(() => {
      const city = this.currentCity();
      if (city) {
        this.loadForecast(city);
      }
    });
  }

  public async searchCities(term: string): Promise<void> {
    if (!term || term.length < 3) {
      this.citySuggestionsSignal.set([]);
      return;
    }

    const cities = await firstValueFrom(this.weatherService.searchCities(term));
    this.citySuggestionsSignal.set(cities || []);
  }

  public async addCity(city: City): Promise<void> {
    const isAlreadyAdded = this.selectedCitiesSignal().some(
      (existingCity) => existingCity.id === city.id,
    );

    if (isAlreadyAdded) {
      return;
    }

    // Update selected cities
    this.selectedCitiesSignal.update((cities) => [...cities, city]);
    this.citySuggestionsSignal.set([]);
    this.currentCitySignal.set(city);

    // Set loading state
    this.loadingStatesSignal.update((states) => {
      const newStates = new Map(states);
      newStates.set(city.id, true);
      return newStates;
    });

    try {
      const weatherData = await firstValueFrom(
        this.weatherService.getWeatherData(city),
      );
      if (weatherData) {
        this.cityWeatherMapSignal.update((map) => {
          const newMap = new Map(map);
          newMap.set(city.id, weatherData);
          return newMap;
        });
      }
    } catch (error) {
      this.errorsSignal.update((errors) => {
        const newErrors = new Map(errors);
        newErrors.set(city.id, (error as Error).message);
        return newErrors;
      });
    } finally {
      this.loadingStatesSignal.update((states) => {
        const newStates = new Map(states);
        newStates.set(city.id, false);
        return newStates;
      });
    }

    // Load air quality data
    firstValueFrom(this.weatherService.getAirQuality(city));
  }

  public deleteCity(city: City): void {
    // Update selected cities
    this.selectedCitiesSignal.update((cities) =>
      cities.filter((c) => c.id !== city.id),
    );

    // Update maps
    this.cityWeatherMapSignal.update((map) => {
      const newMap = new Map(map);
      newMap.delete(city.id);
      return newMap;
    });

    this.loadingStatesSignal.update((states) => {
      const newStates = new Map(states);
      newStates.delete(city.id);
      return newStates;
    });

    this.errorsSignal.update((errors) => {
      const newErrors = new Map(errors);
      newErrors.delete(city.id);
      return newErrors;
    });

    // Clear current city if it's the deleted one
    if (this.currentCity()?.id === city.id) {
      this.currentCitySignal.set(undefined);
    }
  }

  public selectCity(city: City): void {
    this.currentCitySignal.set(city);
  }

  public clearSuggestions(): void {
    this.citySuggestionsSignal.set([]);
  }

  private async loadForecast(city: City): Promise<void> {
    this.isForecastLoadingSignal.set(true);

    try {
      const forecast = await firstValueFrom(
        this.weatherService.getForecast(city),
      );
      if (forecast) {
        this.forecastDaysSignal.set(forecast);
      }
    } finally {
      this.isForecastLoadingSignal.set(false);
    }
  }
}
