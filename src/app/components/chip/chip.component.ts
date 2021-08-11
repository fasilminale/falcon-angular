import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {FiltersModel} from '../../models/filters/filters-model';
import {FormArray} from '@angular/forms';
import { StatusModel } from 'src/app/models/invoice/status-model';

export interface FilterChip {
  type: string;
  label: string;
  group: string;
  tooltips?: string;
}

@Component({
  selector: 'cardinal-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss']
})

export class ChipComponent implements OnChanges {
  @Input() totalResults = 0;
  @Input() filtersModel: FiltersModel = new FiltersModel();
  @Output() chipRemovedEvent: EventEmitter<any> = new EventEmitter<any>();
  chips: Array<FilterChip> = [];
  selectable = true;
  removable = true;

  constructor() { }

  ngOnChanges(): void {
    this.updateChipFilters();
  }

  updateChipFilters(): void {
    this.chips = [];
    const statusForm = this.filtersModel.form.get('invoiceStatuses');
    
    if (statusForm?.value.length > 0) {
      this.chips.push(
        this.formatArrayChip(
          'Status:&nbsp', statusForm as FormArray, this.filtersModel.invoiceStatusOptions, 'invoiceStatuses'
        ));
    }
  }

  formatArrayChip(type: string, formArray: FormArray, arrayOptions: Array<StatusModel>, group: string): FilterChip {
    if (formArray?.value.length === 1) {
      return {
        type,
        label: this.getLabel(formArray.value[0], arrayOptions),
        group
      };
    }
    return {
      type,
      label: formArray?.value.length + ' Selected',
      group,
      tooltips: this.getTooltips(formArray, arrayOptions)
    };
  }

  getLabel(value: string, options: Array<StatusModel>): string {
    return options.filter( option => option.key === value)[0].statusLabel;
  }

  getTooltips(formArray: FormArray, options: Array<StatusModel>): string {
    const tooltips: string[] = [];
    for (const value of formArray.value) {
      tooltips.push(this.getLabel(value, options));
    }
    return tooltips.sort().join('<br>');
  }

  removeChip(group: string): void {
    this.filtersModel.resetGroup(this.filtersModel.form.get(group));
    this.updateChipFilters();
    this.chipRemovedEvent.emit(true);
  }

  clearFilters(): void {
    this.filtersModel.resetForm();
    this.updateChipFilters();
    this.chipRemovedEvent.emit(true);
  }
}
