import {Component, Inject, Input, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {FalRadioOption} from 'src/app/components/fal-radio-input/fal-radio-input.component';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {CostLineItem} from 'src/app/models/line-item/line-item-model';
import {SubscriptionManager, SUBSCRIPTION_MANAGER} from 'src/app/services/subscription-manager';
import {InvoiceOverviewDetail} from "../../../models/invoice/invoice-overview-detail.model";
import {ElmFormHelper} from "@elm/elm-styleguide-ui";

@Component({
  selector: 'app-invoice-amount',
  templateUrl: './invoice-amount.component.html',
  styleUrls: ['./invoice-amount.component.scss']
})
export class InvoiceAmountComponent implements OnInit {

  _formGroup = new FormGroup({});
  amountOfInvoiceControl = new FormControl();
  isValidCostBreakdownAmount = true;
  isPrepaid?: boolean;

  public paymentTermOptions: Array<FalRadioOption> = [
    {value: 'Z000', display: 'Pay Immediately'},
    {value: 'ZN14', display: 'Pay in 14 days'}
  ];
  public currencyOptions = [
    {label: 'USD', value: 'USD', disabled: false},
    {label: 'CAD', value: 'CAD', disabled: false}
  ];
  public costBreakdownTypes = [
    {display: 'Per hour', value: 'PERHOUR'},
    {display: 'Flat', value: 'Flat'},
    {display: 'Per mile', value: 'PERMILE'},
    {display: 'Percent', value: 'Percentage'},
    {display: 'N/A', value: ''}];
  public overridePaymentTermsOptions = [
    {label: 'Override Standard Payment Terms', value: 'override', disabled: false}
  ];
  isPaymentOverrideSelected = new FormArray([]);
  overridePaymentTermsFormGroup = new FormGroup({
    isPaymentOverrideSelected: this.isPaymentOverrideSelected,
    paymentTerms: new FormControl('')
  });

  readOnlyForm = true;
  costBreakdownItems = new FormArray([]);

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) {
  }

  ngOnInit(): void {
    this.setUpOverrideStandardPaymentTermsSubscription();
    this.enableDisableOverrideStandardPaymentTerms();
  }

  setUpOverrideStandardPaymentTermsSubscription(): void {
    this.isPaymentOverrideSelected.valueChanges
      .subscribe((selected: string) => {
        console.log(`selected ${selected}`);
        const selectedBool = selected + '' === this.overridePaymentTermsOptions[0].value ? true : false;
        if (!selectedBool) {
          this.overridePaymentTermsFormGroup.controls.paymentTerms.reset();
        }
      });
  }

  enableDisableOverrideStandardPaymentTerms(): void {
    if (this.readOnlyForm) {
      this.isPaymentOverrideSelected.disable();
    }
    else {
      this.isPaymentOverrideSelected.enable();
    }
  }

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => {
        this.readOnlyForm = !isEditMode;
        this.enableDisableOverrideStandardPaymentTerms();
      }
    ));
  }

  @Input() set loadInvoiceOverviewDetail$(observable: Observable<InvoiceOverviewDetail>) {
    this.subscriptionManager.manage(observable.subscribe(
      invoiceOverviewDetail => this.isPrepaid = invoiceOverviewDetail.freightPaymentTerms === 'PREPAID'
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

  loadForm(givenFormGroup: FormGroup, invoiceAmountDetail?: InvoiceAmountDetail): void {
    givenFormGroup.get('amountOfInvoice')?.setValue(invoiceAmountDetail?.amountOfInvoice ? invoiceAmountDetail.amountOfInvoice : '');
    givenFormGroup.get('currency')?.setValue(invoiceAmountDetail?.currency ? invoiceAmountDetail.currency : '');
    if (!!invoiceAmountDetail?.standardPaymentTermsOverride) {
      ElmFormHelper.checkCheckbox(this.isPaymentOverrideSelected,
        this.overridePaymentTermsOptions[0], true);
    }
    this.overridePaymentTermsFormGroup.controls.paymentTerms.setValue(invoiceAmountDetail?.standardPaymentTermsOverride ? invoiceAmountDetail.standardPaymentTermsOverride : '');
/*    givenFormGroup.get('overridePaymentTerms')?.patchValue({
      isPaymentOverrideSelected: invoiceAmountDetail?.standardPaymentTermsOverride ? true : false,
      paymentTerms: invoiceAmountDetail?.standardPaymentTermsOverride ? invoiceAmountDetail.standardPaymentTermsOverride : ''
    });*/
    givenFormGroup.get('mileage')?.setValue(invoiceAmountDetail?.mileage ? invoiceAmountDetail.mileage : '');
    (givenFormGroup.get('costBreakdownItems') as FormArray).clear();
    this.insertBreakDownItems(invoiceAmountDetail?.costLineItems);
  }

  insertBreakDownItems(costBreakdownItems?: CostLineItem[]): void {
    if (costBreakdownItems && costBreakdownItems.length > 0) {
      this.costBreakdownItems = new FormArray([]);
      costBreakdownItems.forEach((costBreakdownItem) => {
        this.costBreakdownItemsControls.push(new FormGroup({
          charge: new FormControl(costBreakdownItem.chargeCode),
          rateSource: new FormControl(costBreakdownItem.rateSource?.label ?? 'N/A'),
          entrySource: new FormControl(costBreakdownItem.entrySource?.label ?? 'N/A'),
          rate: new FormControl(costBreakdownItem.rateAmount ? `${costBreakdownItem.rateAmount}` : 'N/A'),
          type: new FormControl(costBreakdownItem.rateType ? costBreakdownItem.rateType : ''),
          quantity: new FormControl(costBreakdownItem.quantity ? costBreakdownItem.quantity : 'N/A'),
          totalAmount: new FormControl(costBreakdownItem.chargeLineTotal || 0),
          message: new FormControl(costBreakdownItem.message ?? '')
        }));
      });
    } else {
      this.costBreakdownItems.controls.push(new FormGroup({
        charge: new FormControl(''),
        rateSource: new FormControl(''),
        entrySource: new FormControl(''),
        rate: new FormControl(''),
        type: new FormControl(''),
        quantity: new FormControl(''),
        totalAmount: new FormControl('')
      }));
    }
  }

  get costBreakdownItemsControls(): AbstractControl[] {
    return this._formGroup.get('costBreakdownItems')
      ? (this._formGroup.get('costBreakdownItems') as FormArray).controls
      : new FormArray([]).controls;
  }

  get costBreakdownTotal(): number {
    let totalAmount = 0;
    this.costBreakdownItemsControls.forEach(c => {
      if (c?.get('totalAmount')?.value) {
        totalAmount += parseFloat(c?.get('totalAmount')?.value);
      }
    });
    const invoiceNetAmount = this._formGroup.get('amountOfInvoice')?.value;
    this.isValidCostBreakdownAmount = parseFloat(invoiceNetAmount) > 0
      && totalAmount.toFixed(2) === parseFloat(invoiceNetAmount).toFixed(2);
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
