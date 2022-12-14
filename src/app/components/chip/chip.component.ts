import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {FiltersModel} from '../../models/filters/filters-model';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import {StatusModel} from 'src/app/models/invoice/status-model';
import {FilterService} from '../../services/filter-service';
import { KeyedLabel } from 'src/app/models/generic/keyed-label';
import {formatDate} from '@angular/common';
import {DateTime} from 'luxon';

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

  constructor(public filterService: FilterService) {
  }

  ngOnChanges(): void {
    this.updateChipFilters();
  }

  updateChipFilters(): void {
    this.chips = [];
    const statusForm = this.filtersModel.form.get('invoiceStatuses');
    const originCity = this.filtersModel.form.get('originCity');
    const destinationCity = this.filtersModel.form.get('destinationCity');
    const shippingPointCode = this.filtersModel.form.get('shippingPoints');
    const mode = this.filtersModel.form.get('mode');
    const scac = this.filtersModel.form.get('scac');
    const filterBySpotQuote = this.filtersModel.form.get('filterBySpotQuote');
    const minPickupDateTime = this.filtersModel.form.get('minPickupDateTime');
    const maxPickupDateTime = this.filtersModel.form.get('maxPickupDateTime');

    if (statusForm?.value.length > 0) {
      this.chips.push(
        this.formatArrayChip(
          'Status:&nbsp', statusForm as FormArray, this.filterService.invoiceStatuses, 'invoiceStatuses'
        ));
    }
    if (originCity?.value?.length > 0) {
      this.chips.push(
        this.formatChip('Origin:&nbsp', originCity as FormGroup, 'originCity')
      );
    }

    if (destinationCity?.value?.length > 0) {
      this.chips.push(
        this.formatChip('Dest:&nbsp', destinationCity as FormGroup, 'destinationCity')
      );
    }

    if (scac?.value?.length > 0) {
      this.chips.push(
        this.formatChip(
          'Carrier:&nbsp', scac as FormGroup, 'scac')
        );
    }

    if (filterBySpotQuote?.value) {
      this.chips.push(
        this.formatSpotBooleanChip('Spot Quote', filterBySpotQuote as FormGroup, 'filterBySpotQuote')
      );
    }

    if (shippingPointCode?.value?.length > 0) {
      this.chips.push(
        this.formatChip('Shipping point:&nbsp', shippingPointCode as FormGroup, 'shippingPoints')
      );
    }

    if (minPickupDateTime?.value?.length > 0 || maxPickupDateTime?.value?.length > 0) {
      this.chips.push(
        this.formatDatesRange('Pickup Date:&nbsp', minPickupDateTime?.value, maxPickupDateTime?.value, 'minPickupDateTime')
      );
    }

    if (mode?.value?.length > 0) {
      const arrObjMode = mode?.value.map((m: any) => ({'key': m, 'label': m}));
      this.chips.push(
        this.formatArrayChip('Mode:&nbsp', mode as FormArray, arrObjMode, 'mode')
      );
    }
  }

  formatDatesRange(type: string, minDate: string, maxDate: string, group: string): FilterChip{
    minDate = minDate !== null ? DateTime.fromISO(minDate).toISODate() : 'No start date';
    maxDate = maxDate !== null ? DateTime.fromISO(maxDate).toISODate() : 'No end date';
    return {
      type,
      label: minDate + ' - ' + maxDate,
      group
    }
  }

  formatArrayChip(type: string, formArray: FormArray, arrayOptions: Array<KeyedLabel>, group: string): FilterChip {
    if (formArray.value.length === 1) {
      return {
        type,
        label: this.getLabel(formArray.value[0], arrayOptions),
        group
      };
    }
    return {
      type,
      label: formArray.value.length + ' Selected',
      group,
      tooltips: this.getTooltips(formArray, arrayOptions)
    };
  }

  formatSpotBooleanChip(type: string, formGroup: FormGroup, group: string): { label: any; type: string; group: string } {
    return {
      type,
      label: '',
      group
    };
  }

  formatChip(type: string, formGroup: FormGroup, group: string): { label: any; type: string; group: string } {
    return {
      type,
      label: formGroup.value,
      group
    };
  }

  getLabel(value: string, options: Array<StatusModel>): string {
    return options.filter(option => option.key === value)[0].label;
  }

  getTooltips(formArray: FormArray, options: Array<StatusModel>): string {
    const tooltips: string[] = [];
    for (const value of formArray.value) {
      tooltips.push(this.getLabel(value, options));
    }
    return tooltips.sort().join('<br>');
  }

  removeChip(group: string): void {
    if(group === 'maxPickupDateTime' || group === 'minPickupDateTime'){
      this.filtersModel.resetGroup(this.filtersModel.form.get('maxPickupDateTime'));
      this.filtersModel.resetGroup(this.filtersModel.form.get('minPickupDateTime'));
    } else {
      this.filtersModel.resetGroup(this.filtersModel.form.get(group));
    }
    this.updateChipFilters();
    this.chipRemovedEvent.emit(true);
  }

  clearFilters(): void {
    this.filtersModel.resetForm();
    this.updateChipFilters();
    this.chipRemovedEvent.emit(true);
  }
}
