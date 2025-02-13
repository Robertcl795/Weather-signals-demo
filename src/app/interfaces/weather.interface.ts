export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  id: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  conditions: string;
  icon: string;
  timestamp: Date;
}

export interface ForecastDay {
  day: string;
  temperature: number;
  icon: string;
  description: string;
  tempSum?: number;
  count?: number
}

export interface WeatherResponse {
  current: {
    temp: number;
    weather: [
      {
        description: string;
        icon: string;
      }
    ];
  };
  daily: Array<{
    temp: { day: number };
    weather: [
      {
        description: string;
        icon: string;
      }
    ];
    dt: number;
  }>;
}

export interface AirQuality {
  aqi: number;
  components: {
    co: number;
    no2: number;
    o3: number;
    pm2_5: number;
    pm10: number;
  };
}

export interface CurrentWeatherResponse {
  name: string;
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

export interface ForecastResponse {
  list: Array<{
    dt: number; // Unix timestamp
    main: {
      temp: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
  }>;
}
