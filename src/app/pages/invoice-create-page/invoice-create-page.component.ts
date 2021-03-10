import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {environment} from '../../../environments/environment';
import {Invoice} from '../../models/invoice-model';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-invoice-create-page',
  templateUrl: './invoice-create-page.component.html',
  styleUrls: ['./invoice-create-page.component.scss']
})
export class InvoiceCreatePageComponent implements OnInit {

  public workTypeOptions = ['Indirect Non-PO Invoice'];
  public erpTypeOptions = ['Pharma Corp', 'TPM'];
  public currencyOptions = ['CAD', 'USD'];
  public formGroup: FormGroup;

  private invoice = {} as Invoice;

  public constructor(private webService: WebServices,
                     private snackBar: MatSnackBar) {
    const {required} = Validators;
    this.formGroup = new FormGroup({
      workType: new FormControl(this.invoice.workType, [required]),
      companyCode: new FormControl(this.invoice.companyCode, [required]),
      erpType: new FormControl(this.invoice.erpType, [required]),
      vendorNumber: new FormControl(this.invoice.vendorNumber, [required]),
      externalInvoiceNumber: new FormControl(this.invoice.externalInvoiceNumber, [required]),
      invoiceDate: new FormControl(this.invoice.invoiceDate, [required]),
      amountOfInvoice: new FormControl(this.invoice.amountOfInvoice, [required]),
      currency: new FormControl(this.invoice.currency, [required]),
    });
  }

  public ngOnInit(): void {
    // default work type as long as there is only one value
    if (this.workTypeOptions.length === 1) {
      this.formGroup.controls.workType.setValue(this.workTypeOptions[0]);
    }
  }

  public onSubmit(): void {
    const invoice = this.formGroup.getRawValue() as Invoice;
    invoice.createdBy = 'Falcon User';
    this.webService.httpPost(
      `${environment.baseServiceUrl}/v1/invoice`,
      invoice
    ).subscribe(
      _ => this.openSnackBar('Success, invoice created!'),
      error => this.openSnackBar('Failure, invoice was not created!')
    );
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'close', {duration: 5 * 1000});
  }

}
