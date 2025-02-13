export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  id: string;
}

export interface WeatherData {
  id: City['id'];
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
  count?: number;
}

export interface WeatherResponse {
  current: {
    temp: number;
    weather: [
      {
        description: string;
        icon: string;
      },
    ];
  };
  daily: {
    temp: { day: number };
    weather: [
      {
        description: string;
        icon: string;
      },
    ];
    dt: number;
  }[];
}
export interface AirQualityResponse {
  list: {
    main: {
      aqi: number;
    };
    components?: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }[];
}

export interface AirQuality {
  aqi: number;
  components?: {
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
  weather: {
    description: string;
    icon: string;
  }[];
}

export interface ForecastResponse {
  list: {
    dt: number; // Unix timestamp
    main: {
      temp: number;
    };
    weather: {
      description: string;
      icon: string;
    }[];
  }[];
}
