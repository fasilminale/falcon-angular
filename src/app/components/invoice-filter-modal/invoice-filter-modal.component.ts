import {Component, Inject, Input, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FilterService} from '../../services/filter-service';
import {FiltersModel} from '../../models/filters/filters-model';
import { SelectOption } from 'src/app/models/select-option-model/select-option-model';

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

  constructor(private dialogRef: MatDialogRef<InvoiceFilterModalComponent>,
              public filterService: FilterService, @Inject(MAT_DIALOG_DATA) data: any) {
    this.resetForm();
    this.originCities = data.originCities;
    this.destinationCities = data.destinationCities;
    this.masterDataScacs = data.masterDataScacs;
    this.masterDataShippingPoints = data.masterDataShippingPoints;
  }

  ngOnInit(): void {
    this.sortedMasterDataScacs = this.sortScacs(this.masterDataScacs);
    this.sortedMasterDataShippingPoints = this.sortShippingPoints(this.masterDataShippingPoints);
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

  sortScacs(scacs: Array<SelectOption<string>>) : Array<SelectOption<string>> {
    return scacs.sort(this.compareScacs)
  }

  compareScacs( a: SelectOption<string>, b: SelectOption<string> ): number {
    if ( a.label < b.label ){
      return -1;
    }
    if ( a.label > b.label ){
      return 1;
    }
    return 0;
  }

  sortShippingPoints(shippingPoints: Array<SelectOption<string>>) : Array<SelectOption<string>> {
    return shippingPoints.sort(this.compareShippingPoints)
  }

  compareShippingPoints( a: SelectOption<string>, b: SelectOption<string> ): number {
    if ( a.label < b.label ){
      return -1;
    }
    if ( a.label > b.label ){
      return 1;
    }
    return 0;
  }

}
