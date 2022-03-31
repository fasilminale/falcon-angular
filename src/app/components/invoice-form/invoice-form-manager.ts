import {Inject, Injectable} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  Form,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {catchError, filter, first, map, mergeMap} from 'rxjs/operators';
import {isFalsey} from '../../utils/predicates';
import {FalRadioOption} from '../fal-radio-input/fal-radio-input.component';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../services/subscription-manager';
import {Observable, of, pipe} from 'rxjs';
import {MasterDataService} from 'src/app/services/master-data-service';

/* VALIDATORS */
const {required, pattern} = Validators;

export function validateDate(control: AbstractControl): ValidationErrors | null {
  const dateString = control.value;
  if (dateString) {
    if (!(dateString instanceof Date)) {
      return {validateDate: true};
    } else if (dateString.getFullYear() < 1000
      || dateString.getFullYear() > 9999) {
      return {validateDate: true};
    }
  }
  return null;
}

@Injectable()
export class InvoiceFormManager {

  /* INVOICE FORM GROUP */
  public invoiceFormGroup = new FormGroup({});
  public workType = new FormControl();
  public companyCode = new FormControl();
  public erpType = new FormControl();
  public vendorNumber = new FormControl();
  public externalInvoiceNumber = new FormControl();
  public invoiceDate = new FormControl();
  public amountOfInvoice = new FormControl();
  public currency = new FormControl();
  public comments = new FormControl();
  public lineItems = new FormArray([]);

  /* OVERRIDE PAYMENT TERMS FORM GROUP */
  public osptFormGroup = new FormGroup({});
  public isPaymentOverrideSelected = new FormArray([]);
  public paymentTerms = new FormControl();

  /* MISC FORM CONTROLS */
  public selectedTemplate = new FormControl();

  readonly allowedCharacters = '^[a-zA-Z0-9_-]+$';
  public isInvoiceAmountValid = true;
  /* VALUE OPTIONS */
  // TODO replace these with calls to the backend?
  public workTypeOptions = ['Indirect Non-PO Invoice'];
  public erpTypeOptions = [
    {label: 'Pharma Corp', value: 'Pharma Corp', disabled: false},
    {label: 'TPM', value: 'TPM', disabled: false}
  ];
  public currencyOptions = [
    {label: 'USD', value: 'USD', disabled: false},
    {label: 'CAD', value: 'CAD', disabled: false}
  ];
  public overridePaymentTermsOptions = [
    {label: 'Override Standard Payment Terms', value: 'override', disabled: false}
  ];
  public myTemplateOptions: Array<string> = [];
  public paymentTermOptions: Array<FalRadioOption> = [
    {value: 'Z000', display: 'Pay Immediately'},
    {value: 'ZN14', display: 'Pay in 14 days'}
  ];

  public paymentTermSelectOptions = ['Pay Immediately', 'Pay in 14 days'];

  public totalLineItemNetAmount = 0;

  constructor(
    @Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager,
    private masterDataService: MasterDataService) {
  }

  public init(): void {
    this.workType = new FormControl({value: null}, [required]);
    this.companyCode = new FormControl(null,
      {
        validators: Validators.compose([required, pattern(this.allowedCharacters)]),
        asyncValidators: Validators.composeAsync([this.validateCompanyCode()]), updateOn: 'blur'
      });
    this.erpType = new FormControl({value: null}, [required]);
    this.vendorNumber = new FormControl({value: null}, [required, pattern(this.allowedCharacters)]);
    this.externalInvoiceNumber = new FormControl({value: null}, [required, pattern(this.allowedCharacters)]);
    this.invoiceDate = new FormControl({value: null}, [required, validateDate]);
    this.amountOfInvoice = new FormControl({value: 0}, [required, this.validateInvoiceNetAmount()]);
    this.currency = new FormControl({value: null}, [required]);
    // this.isPaymentOverrideSelected = new FormControl({value: false});
    this.paymentTerms = new FormControl({value: null});
    this.osptFormGroup = new FormGroup({
      isPaymentOverrideSelected: this.isPaymentOverrideSelected,
      paymentTerms: this.paymentTerms
    });
    this.lineItems = new FormArray([]);
    this.comments = new FormControl({value: null});
    this.invoiceFormGroup = new FormGroup({
        workType: this.workType,
        companyCode: this.companyCode,
        erpType: this.erpType,
        vendorNumber: this.vendorNumber,
        externalInvoiceNumber: this.externalInvoiceNumber,
        invoiceDate: this.invoiceDate,
        amountOfInvoice: this.amountOfInvoice,
        currency: this.currency,
        comments: this.comments,
        lineItems: this.lineItems
      }
    );
    this.selectedTemplate = new FormControl({value: null});
    this.invoiceFormGroup.enable();
    this.isPaymentOverrideSelected.enable();
    if (this.myTemplateOptions.length === 0) {
      this.selectedTemplate.disable();
    } else {
      this.selectedTemplate.enable();
    }
    this.establishTouchLink(this.companyCode, this.workType);
    this.establishTouchLink(this.erpType, this.companyCode);
    this.establishTouchLink(this.vendorNumber, this.erpType);
    this.establishTouchLink(this.externalInvoiceNumber, this.vendorNumber);
    this.establishTouchLink(this.invoiceDate, this.externalInvoiceNumber);
    this.establishTouchLink(this.amountOfInvoice, this.invoiceDate);
    this.establishTouchLink(this.currency, this.amountOfInvoice);
    this.establishTouchLink(this.osptFormGroup, this.currency);
    this.establishTouchLink(this.lineItems, this.osptFormGroup);
    this.establishTouchLink(this.comments, this.lineItems);
    this.subscriptionManager.manage(
      // HANDLE PAYMENT TERMS WHEN OVERRIDE SELECTION CHANGES
      this.isPaymentOverrideSelected.valueChanges
        .subscribe((selected: string) => {
          console.log(`selected = ${selected} this.overridePaymentTermsOptions[0].value ${this.overridePaymentTermsOptions[0].value}`);
          const selectedBool = selected + '' === this.overridePaymentTermsOptions[0].value ? true : false;
          if (selectedBool) {
            this.paymentTerms.enable();
          } else {
            this.paymentTerms.reset();
            this.paymentTerms.disable();
          }
        }),
      // RECALCULATE LINE ITEM TOTAL WHEN LINE ITEMS CHANGE
      this.lineItems.valueChanges.subscribe(() => this.calculateLineItemNetAmount()),
      this.companyCode.valueChanges.subscribe(() => this.forceValueToUpperCase(this.companyCode)),
      this.vendorNumber.valueChanges.subscribe(() => this.forceValueToUpperCase(this.vendorNumber)),
      this.externalInvoiceNumber.valueChanges.subscribe(() => this.forceValueToUpperCase(this.externalInvoiceNumber))
    );
    this.isInvoiceAmountValid = true;
  }

  public establishTouchLink(a: AbstractControl, b: AbstractControl): void {
    this.subscriptionManager.manage(
      a.valueChanges.subscribe(() => {
        if (b.untouched) {
          b.markAsTouched();
          this.forceValueChangeEvent(b);
        }
      })
    );
  }

  public forceValueChangeEvent(control: AbstractControl): void {
    control.setValue(control instanceof FormGroup ? (control as FormGroup).getRawValue() : control.value);
  }

  public forceValueToUpperCase(control: AbstractControl): void {
    control.setValue(isFalsey(control.value) ? control.value : control.value.toUpperCase(), {emitEvent: false});
  }

  public lineItemCompanyCode(index: number): FormControl {
    return this.lineItemGroup(index).controls.companyCode as FormControl;
  }

  public lineItemCostCenter(index: number): FormControl {
    return this.lineItemGroup(index).controls.costCenter as FormControl;
  }

  public lineItemGlAccount(index: number): FormControl {
    return this.lineItemGroup(index).controls.glAccount as FormControl;
  }

  public lineItemNetAmount(index: number): FormControl {
    return this.lineItemGroup(index).controls.lineItemNetAmount as FormControl;
  }

  public lineItemNotes(index: number): FormControl {
    return this.lineItemGroup(index).controls.notes as FormControl;
  }

  public lineItemGroup(index: number): FormGroup {
    return this.lineItems.at(index) as FormGroup;
  }

  public removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
  }

  public addNewEmptyLineItem(): void {
    this.lineItems.push(this.createEmptyLineItemGroup());
    this.lineItems.markAsDirty();
  }

  public createEmptyLineItemGroup(): FormGroup {
    const companyCode = new FormControl(null, {
      validators: Validators.compose([pattern(this.allowedCharacters)]),
      asyncValidators: Validators.composeAsync([this.validateCompanyCode()]), updateOn: 'blur'
    });
    const costCenter = new FormControl(null, [required, pattern(this.allowedCharacters)]);
    this.establishTouchLink(costCenter, companyCode);
    const glAccount = new FormControl(null, [required, pattern(this.allowedCharacters)]);
    this.establishTouchLink(glAccount, costCenter);
    const lineItemNetAmount = new FormControl('0', [required, this.validateInvoiceNetAmount()]);
    this.establishTouchLink(lineItemNetAmount, glAccount);
    const notes = new FormControl(null);
    this.establishTouchLink(notes, lineItemNetAmount);
    this.subscriptionManager.manage(
      companyCode.valueChanges.subscribe(() => this.forceValueToUpperCase(companyCode)),
      costCenter.valueChanges.subscribe(() => this.forceValueToUpperCase(costCenter)),
      glAccount.valueChanges.subscribe(() => this.forceValueToUpperCase(glAccount)),
      notes.valueChanges.subscribe(() => this.forceValueToUpperCase(notes))
    );
    return new FormGroup({companyCode, costCenter, glAccount, lineItemNetAmount, notes});
  }

  public calculateLineItemNetAmount(): void {
    this.totalLineItemNetAmount = 0;
    for (const control of this.lineItems.controls) {
      const lineItemGroup = (control as FormGroup);
      this.totalLineItemNetAmount += parseFloat(lineItemGroup.controls.lineItemNetAmount.value);
    }
  }

  validateInvoiceNetAmountSum() {
    const amountOfInvoice = this.invoiceFormGroup?.controls.amountOfInvoice?.value;
    if (amountOfInvoice) {
      const value = parseFloat(amountOfInvoice);
      if (value > 0 && value === this.totalLineItemNetAmount) {
        this.isInvoiceAmountValid = true;
      } else {
        this.isInvoiceAmountValid = false;
      }
    }
  }

  validateInvoiceNetAmount(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = parseFloat(control.value) > 0;
      return value ? null : {isGreaterThanZero: {value: control.value}};
    };
  }

  validateCompanyCode(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const companyCode = control.value;
      if (companyCode) {
        return this.masterDataService.checkCompanyCode(companyCode)
          .pipe(
            mergeMap(() => {
              return of(null);
            }),
            catchError(() => {
              return of({validateCompanyCode: {value: companyCode}});
            })
          );
      } else {
        return of(null);
      }
    };
  }

}
