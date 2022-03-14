import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FalRadioOption } from 'src/app/components/fal-radio-input/fal-radio-input.component';
import { InvoiceAmountDetail } from 'src/app/models/invoice/invoice-amount-detail-model';
import { CostLineItem } from 'src/app/models/line-item/line-item-model';
import { SubscriptionManager, SUBSCRIPTION_MANAGER } from 'src/app/services/subscription-manager';

@Component({
  selector: 'app-invoice-amount',
  templateUrl: './invoice-amount.component.html',
  styleUrls: ['./invoice-amount.component.scss']
})
export class InvoiceAmountComponent implements OnInit {

  _formGroup = new FormGroup({});
  amountOfInvoiceControl = new FormControl();
  currencyControl = new FormControl();
  paymentTermsControl = new FormControl();
  isValidCostBreakdownAmount = true

  public paymentTermOptions: Array<FalRadioOption> = [
    {value: 'Z000', display: 'Pay Immediately'},
    {value: 'ZN14', display: 'Pay in 14 days'}
  ];

  public currencyOptions = ['USD', 'CAD'];
  public costBreakdownTypes = [
    {display: 'Per hour', value: 'PERHOUR'},
    {display: 'Flat', value: 'Flat'},
    {display: 'Per mile', value: 'PERMILE'},
    {display: 'Percent', value: 'Percentage'},
    {display: 'N/A', value: ''}];

    totalInvoiceAmount = 0;

  overridePaymentTermsFormGroup  = new FormGroup({
    isPaymentOverrideSelected: new FormControl(false),
    paymentTerms: new FormControl('')
  });

  readOnlyForm = true;
  costBreakdownItems = new FormArray([]);

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => this.readOnlyForm = !isEditMode
    ));
  }

  @Input() set formGroup(givenFormGroup: FormGroup) {
    givenFormGroup.setControl('amountOfInvoice', new FormControl('', [Validators.required]));
    givenFormGroup.setControl('currency', new FormControl(''));
    givenFormGroup.setControl('overridePaymentTerms', this.overridePaymentTermsFormGroup);
    givenFormGroup.setControl('paymentTerms', new FormControl(''));
    givenFormGroup.setControl('mileage', new FormControl());
    this.insertBreakDownItems();
    givenFormGroup.setControl('costBreakdownItems', this.costBreakdownItems);
    this._formGroup = givenFormGroup;
  }


  loadForm(givenFormGroup: FormGroup, invoiceAmountDetail?: InvoiceAmountDetail) {
    givenFormGroup.get('amountOfInvoice')?.setValue(invoiceAmountDetail?.amountOfInvoice ? invoiceAmountDetail.amountOfInvoice : '');
    givenFormGroup.get('currency')?.setValue(invoiceAmountDetail?.currency ? invoiceAmountDetail.currency : '');
    givenFormGroup.get('overridePaymentTerms')?.patchValue({
      isPaymentOverrideSelected: invoiceAmountDetail?.standardPaymentTermsOverride ? true : false,
      paymentTerms: invoiceAmountDetail?.standardPaymentTermsOverride ? invoiceAmountDetail.standardPaymentTermsOverride : ''
    });
    givenFormGroup.get('mileage')?.setValue(invoiceAmountDetail?.mileage ? invoiceAmountDetail.mileage : '');
    (givenFormGroup.get('costBreakdownItems') as FormArray).clear()
    this.insertBreakDownItems(invoiceAmountDetail?.costLineItems);
  }

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) { }

  ngOnInit(): void {
  }

  insertBreakDownItems(costBreakdownItems?: CostLineItem[]) {
    if(costBreakdownItems && costBreakdownItems.length > 0) {
      this.costBreakdownItems = new FormArray([]);
      costBreakdownItems.forEach((costBreakdownItem)=> {
        this.costBreakdownItemsControls.push(new FormGroup({
          charge: new FormControl(costBreakdownItem.chargeCode),
          rate: new FormControl(costBreakdownItem.rateAmount ? `${costBreakdownItem.rateAmount}` : 'N/A'),
          type: new FormControl(costBreakdownItem.rateType ? costBreakdownItem.rateType : ''),
          quantity: new FormControl(costBreakdownItem.quantity ? costBreakdownItem.quantity  : 'N/A'),
          totalAmount: new FormControl(costBreakdownItem.chargeLineTotal || 0),
          message: new FormControl(costBreakdownItem.message ?? '')
      }));
      })
    } else  {
      this.costBreakdownItems.controls.push(new FormGroup({
        charge: new FormControl(''),
        rate: new FormControl(''),
        type: new FormControl(''),
        quantity: new FormControl(''),
        totalAmount: new FormControl('')
    }));
    }

  }

  get costBreakdownItemsControls() {
    return this._formGroup.get('costBreakdownItems') ? (this._formGroup.get('costBreakdownItems') as FormArray).controls: new FormArray([]).controls;
  }

  get costBreakdownTotal() {
    let totalAmount = 0;
    this.costBreakdownItemsControls.forEach(c => {
      if(c?.get('totalAmount')?.value) {
        totalAmount += parseFloat(c?.get('totalAmount')?.value);
      }
    });
    const invoiceNetAmount = this._formGroup.get('amountOfInvoice')?.value;
    this.isValidCostBreakdownAmount = parseFloat(invoiceNetAmount) > 0 && totalAmount.toFixed(2) === parseFloat(invoiceNetAmount).toFixed(2);
    return totalAmount;
  }

  @Input() set loadInvoiceAmountDetail$(observable: Observable<InvoiceAmountDetail>) {
    this.subscriptionManager.manage(observable.subscribe(
      invoiceAmountDetail => this.loadForm(this._formGroup, invoiceAmountDetail)
    ));
  }

  get hasMileage(): boolean {
    return !!this._formGroup?.get('mileage')?.value;
  }
}
