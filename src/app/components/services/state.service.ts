import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { WeatherService } from './weather.service';
import { City, ForecastDay, WeatherData } from '../../interfaces/weather.interface';

// Action Types
export enum WeatherActionType {
  SEARCH_CITIES = '[Weather] Search Cities',
  ADD_CITY = '[Weather] Add City',
  DELETE_CITY = '[Weather] Delete City',
  SELECT_CITY = '[Weather] Select City',
  SET_WEATHER_DATA = '[Weather] Set Weather Data',
  SET_FORECAST_DATA = '[Weather] Set Forecast Data',
  SET_LOADING = '[Weather] Set Loading',
  SET_ERROR = '[Weather] Set Error',
  CLEAR_SUGGESTIONS = '[Weather] Clear Suggestions'
}

// Action Interfaces
interface SearchCitiesAction {
  type: WeatherActionType.SEARCH_CITIES;
  cities: City[];
}

interface AddCityAction {
  type: WeatherActionType.ADD_CITY;
  city: City;
}

interface DeleteCityAction {
  type: WeatherActionType.DELETE_CITY;
  city: City;
}

interface SelectCityAction {
  type: WeatherActionType.SELECT_CITY;
  city: City;
}

interface SetWeatherDataAction {
  type: WeatherActionType.SET_WEATHER_DATA;
  cityName: string;
  data: WeatherData;
}

interface SetForecastDataAction {
  type: WeatherActionType.SET_FORECAST_DATA;
  forecast: ForecastDay[];
}

interface SetLoadingAction {
  type: WeatherActionType.SET_LOADING;
  cityName: string;
  isLoading: boolean;
}

interface SetErrorAction {
  type: WeatherActionType.SET_ERROR;
  cityName: string;
  error: string;
}

interface ClearSuggestionsAction {
  type: WeatherActionType.CLEAR_SUGGESTIONS;
}

type WeatherAction =
  | SearchCitiesAction
  | AddCityAction
  | DeleteCityAction
  | SelectCityAction
  | SetWeatherDataAction
  | SetForecastDataAction
  | SetLoadingAction
  | SetErrorAction
  | ClearSuggestionsAction;

// State Interface
interface WeatherState {
  selectedCities: City[];
  cityWeatherMap: Map<string, WeatherData>;
  loadingStates: Map<string, boolean>;
  currentCity: City | null;
  forecastDays: ForecastDay[];
  citySuggestions: City[];
  errors: Map<string, string>;
  isForecastLoading: boolean;
}

const initialState: WeatherState = {
  selectedCities: [],
  cityWeatherMap: new Map(),
  loadingStates: new Map(),
  currentCity: null,
  forecastDays: [],
  citySuggestions: [],
  errors: new Map(),
  isForecastLoading: false,
};

@Injectable({
  providedIn: 'root',
})
export class WeatherStateService {
  private weatherService = inject(WeatherService);
  
  // State signal
  private state = signal<WeatherState>(initialState);

  // Computed signals (public readonly access)
  public selectedCities = computed(() => this.state().selectedCities);
  public cityWeatherMap = computed(() => this.state().cityWeatherMap);
  public loadingStates = computed(() => this.state().loadingStates);
  public currentCity = computed(() => this.state().currentCity);
  public forecastDays = computed(() => this.state().forecastDays);
  public citySuggestions = computed(() => {
    // Filter out already selected cities from suggestions
    const selectedCityKeys = new Set(
      this.state().selectedCities.map(city => this.createCityKey(city))
    );
    return this.state().citySuggestions.filter(
      city => !selectedCityKeys.has(this.createCityKey(city))
    );
  });
  public errors = computed(() => this.state().errors);
  public isForecastLoading = computed(() => this.state().isForecastLoading);

  // Create a unique key for a city based on its coordinates
  private createCityKey(city: City): string {
    return `${city.name}-${city.lat.toFixed(4)}-${city.lon.toFixed(4)}-${city.country}`;
  }

  constructor() {
    // Effect to automatically load forecast when current city changes
    effect(() => {
      const city = this.currentCity();
      if (city) {
        this.loadForecast(city);
      }
    });
  }

  // Reducer
  private reduce(state: WeatherState, action: WeatherAction): WeatherState {
    switch (action.type) {
      case WeatherActionType.SEARCH_CITIES:
        return {
          ...state,
          citySuggestions: action.cities,
        };

      case WeatherActionType.ADD_CITY: {
        // Check if city is already added using the unique key
        const cityKey = this.createCityKey(action.city);
        const isAlreadyAdded = state.selectedCities.some(
          city => this.createCityKey(city) === cityKey
        );

        if (isAlreadyAdded) {
          return state;
        }

        return {
          ...state,
          selectedCities: [...state.selectedCities, action.city],
          citySuggestions: [], // Clear suggestions after adding
        };
      }

      case WeatherActionType.DELETE_CITY: {
        const newCityWeatherMap = new Map(state.cityWeatherMap);
        const newLoadingStates = new Map(state.loadingStates);
        const newErrors = new Map(state.errors);

        newCityWeatherMap.delete(action.city.name);
        newLoadingStates.delete(action.city.name);
        newErrors.delete(action.city.name);

        return {
          ...state,
          selectedCities: state.selectedCities.filter(
            (c) => this.createCityKey(c) !== this.createCityKey(action.city)
          ),
          cityWeatherMap: newCityWeatherMap,
          loadingStates: newLoadingStates,
          errors: newErrors,
          currentCity:
            this.createCityKey(state.currentCity!) === this.createCityKey(action.city)
              ? null
              : state.currentCity,
        };
      }

      case WeatherActionType.SELECT_CITY:
        return {
          ...state,
          currentCity: action.city,
        };

      case WeatherActionType.SET_WEATHER_DATA:
        return {
          ...state,
          cityWeatherMap: new Map(state.cityWeatherMap).set(
            action.cityName,
            action.data
          ),
        };

      case WeatherActionType.SET_FORECAST_DATA:
        return {
          ...state,
          forecastDays: action.forecast,
        };

      case WeatherActionType.SET_LOADING:
        return {
          ...state,
          loadingStates: new Map(state.loadingStates).set(
            action.cityName,
            action.isLoading
          ),
        };

      case WeatherActionType.SET_ERROR:
        return {
          ...state,
          errors: new Map(state.errors).set(action.cityName, action.error),
        };

      case WeatherActionType.CLEAR_SUGGESTIONS:
        return {
          ...state,
          citySuggestions: [],
        };

      default:
        return state;
    }
  }

  // Dispatch method
  private dispatch(action: WeatherAction) {
    this.state.update((state) => this.reduce(state, action));
  }

  // Public methods that components will use
  public async searchCities(term: string): Promise<void> {
    if (!term || term.length < 3) {
      this.dispatch({ type: WeatherActionType.SEARCH_CITIES, cities: [] });
      return;
    }

    const cities = await this.weatherService.searchCities(term).toPromise();
    this.dispatch({ type: WeatherActionType.SEARCH_CITIES, cities: cities || [] });
  }

  public async addCity(city: City): Promise<void> {
    this.dispatch({ type: WeatherActionType.ADD_CITY, city });
    this.dispatch({ type: WeatherActionType.SELECT_CITY, city });
    this.dispatch({
      type: WeatherActionType.SET_LOADING,
      cityName: city.name,
      isLoading: true,
    });

    try {
      const weatherData = await this.weatherService
        .getWeatherData(city)
        .toPromise();

      if (weatherData) {
        this.dispatch({
          type: WeatherActionType.SET_WEATHER_DATA,
          cityName: city.name,
          data: weatherData,
        });
      }
    } catch (error) {
      this.dispatch({
        type: WeatherActionType.SET_ERROR,
        cityName: city.name,
        error: (error as Error).message,
      });
    } finally {
      this.dispatch({
        type: WeatherActionType.SET_LOADING,
        cityName: city.name,
        isLoading: false,
      });
    }

    // Load air quality data
    this.weatherService
      .getAirQuality(city)
      .subscribe();
  }

  public deleteCity(city: City): void {
    this.dispatch({ type: WeatherActionType.DELETE_CITY, city });
  }

  public selectCity(city: City): void {
    this.dispatch({ type: WeatherActionType.SELECT_CITY, city });
  }

  public clearSuggestions(): void {
    this.dispatch({ type: WeatherActionType.CLEAR_SUGGESTIONS });
  }

  private async loadForecast(city: City): Promise<void> {
    this.state.update(state => ({ ...state, isForecastLoading: true }));

    try {
      const forecast = await this.weatherService.getForecast(city).toPromise();
      if (forecast) {
        this.dispatch({
          type: WeatherActionType.SET_FORECAST_DATA,
          forecast,
        });
      }
    } finally {
      this.state.update(state => ({ ...state, isForecastLoading: false }));
    }
  }
}