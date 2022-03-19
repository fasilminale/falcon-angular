import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FilterService} from '../../services/filter-service';
import {FiltersModel} from '../../models/filters/filters-model';

@Component({
  selector: 'app-loads-filter-modal',
  templateUrl: './invoice-filter-modal.component.html',
  styleUrls: ['./invoice-filter-modal.component.scss']
})
export class InvoiceFilterModalComponent implements OnInit {
  localFilterModel: FiltersModel = new FiltersModel();
  constructor(private dialogRef: MatDialogRef<InvoiceFilterModalComponent>,
              public filterService: FilterService) {
    this.resetForm();
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
      console.log(this.localFilterModel);
      this.filterService.invoiceFilterModel = this.localFilterModel;
      this.dialogRef.close(true);
    }
  }

  clearFilters(): void {
    this.localFilterModel.resetForm();
  }
}
