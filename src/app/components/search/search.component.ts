import { Component, input, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { City } from '../../interfaces/weather.interface';

@Component({
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  selector: 'app-search-bar',
  templateUrl: 'search.component.html',
})
export class SearchBarComponent {
  cities = input<City[]>([]);
  searchChange = output<string>();
  citySelect = output<City>();

  searchControl = new FormControl<string | City>('');

  constructor() {
    // Set up autocomplete filtering
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        map((value: string | City | null) => {
          const searchTerm =
            typeof value === 'string' ? value : value?.name || '';
          this.searchChange.emit(searchTerm);
          return this.cities;
        }),
      )
      .subscribe();
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    this.citySelect.emit(event.option.value);
    this.searchControl.reset();
  }

  trackSuggestion(city: City) {
    return `${city.id}-suggestion`;
  }
}
