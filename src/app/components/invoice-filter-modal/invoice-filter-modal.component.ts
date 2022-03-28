import {Component, Inject, Input, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FilterService} from '../../services/filter-service';
import {FiltersModel} from '../../models/filters/filters-model';
import { SelectOption } from 'src/app/models/select-option-model/select-option-model';
import { CarrierReference } from 'src/app/models/master-data-models/carrier-model';
import { InvoiceUtils } from 'src/app/models/invoice/invoice-model';

@Component({
  selector: 'app-loads-filter-modal',
  templateUrl: './invoice-filter-modal.component.html',
  styleUrls: ['./invoice-filter-modal.component.scss']
})
export class InvoiceFilterModalComponent implements OnInit {
  localFilterModel: FiltersModel = new FiltersModel();

  originCities: Array<SelectOption<string>> = [];
  destinationCities: Array<SelectOption<string>> = [];

  constructor(private dialogRef: MatDialogRef<InvoiceFilterModalComponent>,
              public filterService: FilterService, @Inject(MAT_DIALOG_DATA) data: any) {
    this.resetForm();
    this.originCities = data.originCities;
    this.destinationCities = data.destinationCities;
  }

  ngOnInit(): void {
  }

  resetForm(): void {
    this.localFilterModel.form = this.filterService.invoiceFilterModel.cloneAbstractControl(
      this.filterService.invoiceFilterModel.form
    );
  }

  onSubmit(): void {
    if (this.localFilterModel.form.valid) {
      this.filterService.invoiceFilterModel = this.localFilterModel;
      this.dialogRef.close(true);
    }
  }

  clearFilters(): void {
    this.localFilterModel.resetForm();
  }

  compareCitiesWith(item: any, value: any) {
    return item.value === value;
  }

}
