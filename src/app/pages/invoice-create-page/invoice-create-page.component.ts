import {Component, OnInit} from '@angular/core';
import {Form, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {environment} from '../../../environments/environment';
import {Invoice} from '../../models/invoice/invoice-model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EMPTY_LINE_ITEM, LineItem} from '../../models/line-item/line-item-model';
import {LintCommand} from '@angular/cli/commands/lint-impl';

@Component({
  selector: 'app-invoice-create-page',
  templateUrl: './invoice-create-page.component.html',
  styleUrls: ['./invoice-create-page.component.scss']
})
export class InvoiceCreatePageComponent implements OnInit {

  public workTypeOptions = ['Indirect Non-PO Invoice'];
  public erpTypeOptions = ['Pharma Corp', 'TPM'];
  public currencyOptions = ['CAD', 'USD'];
  public lineItemRemoveButtonDisable = true;
  public invoiceFormGroup: FormGroup;

  get lineItemsFormArray(): FormArray {
    return this.invoiceFormGroup.get('lineItems') as FormArray;
  }

  public constructor(private webService: WebServices,
                     private snackBar: MatSnackBar) {
    const {required} = Validators;
    this.invoiceFormGroup = new FormGroup({
      workType: new FormControl('', [required]),
      companyCode: new FormControl('', [required]),
      erpType: new FormControl('', [required]),
      vendorNumber: new FormControl('', [required]),
      externalInvoiceNumber: new FormControl('', [required]),
      invoiceDate: new FormControl('', [required]),
      amountOfInvoice: new FormControl(0, [required]),
      currency: new FormControl('', [required]),
      lineItems: new FormArray([])
    });
    if (this.lineItemsFormArray.length <= 0) {
      this.addNewEmptyLineItem();
    }
  }

  public ngOnInit(): void {
    // default work type as long as there is only one value
    if (this.workTypeOptions.length === 1) {
      this.invoiceFormGroup.controls.workType.setValue(this.workTypeOptions[0]);
    }
  }

  public addNewEmptyLineItem(): void {
    this.lineItemsFormArray.push(this.createEmptyLineItemForm());
    if (this.lineItemsFormArray.length > 1) {
      this.lineItemRemoveButtonDisable = false;
    }
  }

  private createEmptyLineItemForm(): FormGroup {
    return new FormGroup({
      glAccount: new FormControl(''),
      costCenter: new FormControl(''),
      companyCode: new FormControl(''),
      lineItemNetAmount: new FormControl(0),
      notes: new FormControl('')
    });
  }

  public removeLineItem(index: number): void {
    this.lineItemsFormArray.removeAt(index);
    if (this.lineItemsFormArray.length <= 1) {
      this.lineItemRemoveButtonDisable = true;
    }
  }

  public onSubmit(): void {
    const invoice = this.invoiceFormGroup.getRawValue() as Invoice;
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
