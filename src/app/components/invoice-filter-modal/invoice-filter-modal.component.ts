import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FilterService} from '../../services/filter-service';
import {FiltersModel} from '../../models/filters/filters-model';
import {SelectOption} from 'src/app/models/select-option-model/select-option-model';
import {EnvironmentService} from '../../services/environment-service/environment-service';

@Component({
  selector: 'app-loads-filter-modal',
  templateUrl: './invoice-filter-modal.component.html',
  styleUrls: ['./invoice-filter-modal.component.scss']
})
export class InvoiceFilterModalComponent implements OnInit {
  localFilterModel: FiltersModel = new FiltersModel();

  originCities: Array<SelectOption<string>> = [];
  destinationCities: Array<SelectOption<string>> = [];
  masterDataScacs: Array<SelectOption<string>> = [];
  sortedMasterDataScacs: Array<SelectOption<string>> = [];
  masterDataShippingPoints: Array<SelectOption<string>> = [];
  sortedMasterDataShippingPoints: Array<SelectOption<string>> = [];
  masterDataModes: Array<SelectOption<string>> = [];
  sortedMasterDataModes: Array<SelectOption<string>> = [];

  constructor(private dialogRef: MatDialogRef<InvoiceFilterModalComponent>,
              public filterService: FilterService, @Inject(MAT_DIALOG_DATA) data: any,
              private environmentService: EnvironmentService) {
    this.resetForm();
    this.originCities = data.originCities;
    this.destinationCities = data.destinationCities;
    this.masterDataScacs = data.masterDataScacs;
    this.masterDataShippingPoints = data.masterDataShippingPoints;
    this.masterDataModes = data.masterDataModes;
  }

  ngOnInit(): void {
    this.sortedMasterDataScacs = this.sortScacs(this.masterDataScacs);
    this.sortedMasterDataShippingPoints = this.sortShippingPoints(this.masterDataShippingPoints);
    this.sortedMasterDataModes = this.sortModes(this.masterDataModes);
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

  onCancel(): void {
    this.dialogRef.close();
  }

  clearFilters(): void {
    this.localFilterModel.resetForm();
  }

  compareCitiesWith(item: any, value: any): boolean {
    return item.value === value;
  }

  sortScacs(scacs: Array<SelectOption<string>>): Array<SelectOption<string>> {
    return scacs.sort(this.compareOptions);
  }

  sortShippingPoints(shippingPoints: Array<SelectOption<string>>): Array<SelectOption<string>> {
    return shippingPoints.sort(this.compareOptions);
  }

  sortModes(modes: Array<SelectOption<string>>): Array<SelectOption<string>> {
    return modes.sort(this.compareOptions);
  }

  compareOptions(a: SelectOption<string>, b: SelectOption<string>): number {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  }

  get showDateRangeFilters(): boolean {
    return this.environmentService.showFeature('dateRangeFilters');
  }

}
