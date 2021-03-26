import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {environment} from '../../../environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {LoadingService} from '../../services/loading-service';

@Component({
  selector: 'app-detail-create-page',
  templateUrl: './invoice-detail-page.component.html',
  styleUrls: ['./invoice-detail-page.component.scss']
})
export class InvoiceDetailPageComponent implements OnInit {

  public readonly regex = /[a-zA-Z0-9_\\-]/;

  public readOnly = true;
  public milestonesTabOpen = false;
  public falconInvoiceNumber = '';
  public milestones: Array<any> = [];
  public workTypeOptions = ['Indirect Non-PO Invoice'];
  public erpTypeOptions = ['Pharma Corp', 'TPM'];
  public currencyOptions = ['CAD', 'USD'];
  public lineItemRemoveButtonDisable = true;
  public invoiceFormGroup: FormGroup;
  public validAmount = true;

  private invoice = new InvoiceDataModel();

  public constructor(private webService: WebServices,
                     private route: ActivatedRoute,
                     private snackBar: MatSnackBar,
                     private router: Router,
                     private loadingService: LoadingService) {
    const {required} = Validators;
    this.invoiceFormGroup = new FormGroup({
      workType: new FormControl({value: null, disabled: this.readOnly}, [required]),
      companyCode: new FormControl({value: null, disabled: this.readOnly}, [required]),
      erpType: new FormControl({value: null, disabled: this.readOnly}, [required]),
      vendorNumber: new FormControl({value: null, disabled: this.readOnly}, [required]),
      externalInvoiceNumber: new FormControl({value: null, disabled: this.readOnly}, [required]),
      invoiceDate: new FormControl({value: null, disabled: this.readOnly}, [required]),
      amountOfInvoice: new FormControl({value: '0', disabled: this.readOnly}, [required]),
      currency: new FormControl({value: null, disabled: this.readOnly}, [required]),
      lineItems: new FormArray([])
    });
  }

  public ngOnInit(): void {
    this.getLoadId();
    this.loadData();
  }

  public getLoadId(): void {
    this.route.paramMap.subscribe(params => {
      const falconInvoiceNumber = params.get('falconInvoiceNumber');
      falconInvoiceNumber ? this.falconInvoiceNumber = falconInvoiceNumber : this.falconInvoiceNumber = '';
    });
  }

  public loadData(): void {
    this.loadingService.showLoading();
    this.webService.httpGet(`${environment.baseServiceUrl}/v1/invoice/${this.falconInvoiceNumber}`)
      .subscribe( (invoice: any) => {
        this.invoice = new InvoiceDataModel(invoice);
        this.invoiceFormGroup.controls.workType.setValue(invoice.workType);
        this.invoiceFormGroup.controls.companyCode.setValue(invoice.companyCode);
        this.invoiceFormGroup.controls.erpType.setValue(invoice.erpType);
        this.invoiceFormGroup.controls.vendorNumber.setValue(invoice.vendorNumber);
        this.invoiceFormGroup.controls.externalInvoiceNumber.setValue(invoice.externalInvoiceNumber);
        this.invoiceFormGroup.controls.invoiceDate.setValue(new Date(invoice.invoiceDate));
        this.invoiceFormGroup.controls.amountOfInvoice.setValue(invoice.amountOfInvoice);
        this.invoiceFormGroup.controls.currency.setValue(invoice.currency);
        for (const lineItem of invoice.lineItems) {
          this.lineItemsFormArray.push(new FormGroup({
            glAccount: new FormControl({value: lineItem.glAccount, disabled: this.readOnly}, [Validators.required]),
            costCenter: new FormControl({value: lineItem.costCenter, disabled: this.readOnly}, [Validators.required]),
            companyCode: new FormControl({value: lineItem.companyCode, disabled: this.readOnly}),
            lineItemNetAmount: new FormControl({value: lineItem.lineItemNetAmount, disabled: this.readOnly}, [Validators.required]),
            notes: new FormControl({value: lineItem.notes, disabled: this.readOnly})
          }));
        }
        this.milestones = invoice.milestones;
        this.loadingService.hideLoading();
      });
  }

  get lineItemsFormArray(): FormArray {
    return this.invoiceFormGroup.get('lineItems') as FormArray;
  }

  public lineItemNetAmountFormControl(index: number): FormControl {
    const lineItemFormGroup = this.lineItemsFormArray.at(index) as FormGroup;
    return lineItemFormGroup.get('lineItemNetAmount') as FormControl;
  }

  get amountOfInvoiceFormControl(): FormControl {
    return this.invoiceFormGroup.get('amountOfInvoice') as FormControl;
  }

  get erpType(): AbstractControl {
    return this.invoiceFormGroup.controls.erpType;
  }

  get workType(): AbstractControl {
    return this.invoiceFormGroup.controls.workType;
  }

  get companyCode(): AbstractControl {
    return this.invoiceFormGroup.controls.companyCode;
  }

  get externalInvoiceNumber(): AbstractControl {
    return this.invoiceFormGroup.controls.externalInvoiceNumber;
  }

  get vendorNumber(): AbstractControl {
    return this.invoiceFormGroup.controls.vendorNumber;
  }

  get invoiceDate(): AbstractControl {
    return this.invoiceFormGroup.controls.invoiceDate;
  }

  get amountOfInvoice(): AbstractControl {
    return this.invoiceFormGroup.controls.amountOfInvoice;
  }

  get currency(): AbstractControl {
    return this.invoiceFormGroup.controls.currency;
  }

  public toggleMilestones(): void {
    this.milestonesTabOpen = !this.milestonesTabOpen;
  }
}
