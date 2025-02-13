import { Observable, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { City } from '../interfaces/weather.interface';

export function searchCities(
  service: { searchCities: (query: string) => Observable<City[]> }
) {
  return (source: Observable<string>) =>
    source.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => term.length >= 3),
      switchMap(term => service.searchCities(term))
    );
}