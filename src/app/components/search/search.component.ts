import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { City } from '../../interfaces/weather.interface';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  selector: 'search-bar',
  templateUrl: 'search.component.html',
})
export class SearchBarComponent {
  @Input() cities: any[] = [];
  @Output() searchChange = new EventEmitter<string>();
  @Output() citySelect = new EventEmitter<any>();

  searchControl = new FormControl('');

  constructor() {
    // Set up autocomplete filtering
    this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        console.log("🚀 ~ SearchBarComponent ~ map ~ value:", value)
        const searchTerm =
          typeof value === 'string' ? value : value?.name || '';
        this.searchChange.emit(searchTerm);
        return this.cities;
      })
    ).subscribe();
  }

  onOptionSelected(event: any) {
    this.citySelect.emit(event.option.value);
    this.searchControl.reset();
  }

  trackSuggestion(city: City) {
    return `${city.id}-suggestion`
  }
}
/**
 * 
 * 
 * Could we change the state management into it's dedicated service, and also reduce the complexity by implementing a reducer pattern? We have already defined the different events for this: (search_city, add_city, select_city, delete_city)
 */