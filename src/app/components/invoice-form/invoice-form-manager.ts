import {Injectable} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {catchError, mergeMap} from 'rxjs/operators';
import {isFalsey} from '../../utils/predicates';
import {FalRadioOption} from '../fal-radio-input/fal-radio-input.component';
import {Observable, of, Subscription} from 'rxjs';
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
  public invoiceFormGroup = new UntypedFormGroup({});
  public workType = new UntypedFormControl();
  public companyCode = new UntypedFormControl();
  public erpType = new UntypedFormControl();
  public vendorNumber = new UntypedFormControl();
  public externalInvoiceNumber = new UntypedFormControl();
  public invoiceDate = new UntypedFormControl();
  public amountOfInvoice = new UntypedFormControl();
  public currency = new UntypedFormControl();
  public comments = new UntypedFormControl();
  public lineItems = new UntypedFormArray([]);

  /* OVERRIDE PAYMENT TERMS FORM GROUP */
  public osptFormGroup = new UntypedFormGroup({});
  public isPaymentOverrideSelected = new UntypedFormArray([]);
  public paymentTerms = new UntypedFormControl();

  /* MISC FORM CONTROLS */
  public selectedTemplate = new UntypedFormControl();

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

  private readonly subscriptions = new Subscription();

  constructor(
    private masterDataService: MasterDataService) {
  }

  public init(): void {
    this.workType = new UntypedFormControl({value: null}, [required]);
    this.companyCode = new UntypedFormControl(null,
      {
        validators: Validators.compose([required, pattern(this.allowedCharacters)]),
        asyncValidators: Validators.composeAsync([this.validateCompanyCode()]), updateOn: 'blur'
      });
    this.erpType = new UntypedFormControl({value: null}, [required]);
    this.vendorNumber = new UntypedFormControl({value: null}, [required, pattern(this.allowedCharacters)]);
    this.externalInvoiceNumber = new UntypedFormControl({value: null}, [required, pattern(this.allowedCharacters)]);
    this.invoiceDate = new UntypedFormControl({value: null}, [required, validateDate]);
    this.amountOfInvoice = new UntypedFormControl({value: 0}, [required, this.validateInvoiceNetAmount()]);
    this.currency = new UntypedFormControl({value: null}, [required]);
    // this.isPaymentOverrideSelected = new FormControl({value: false});
    this.paymentTerms = new UntypedFormControl({value: null});
    this.osptFormGroup = new UntypedFormGroup({
      isPaymentOverrideSelected: this.isPaymentOverrideSelected,
      paymentTerms: this.paymentTerms
    });
    this.lineItems = new UntypedFormArray([]);
    this.comments = new UntypedFormControl({value: null});
    this.invoiceFormGroup = new UntypedFormGroup({
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
    this.selectedTemplate = new UntypedFormControl({value: null});
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
    this.subscriptions.add(
      // HANDLE PAYMENT TERMS WHEN OVERRIDE SELECTION CHANGES
      this.isPaymentOverrideSelected.valueChanges
        .subscribe((selected: string) => {
          const selectedBool = selected + '' === this.overridePaymentTermsOptions[0].value ? true : false;
          if (selectedBool) {
            this.paymentTerms.enable();
          } else {
            this.paymentTerms.reset();
            this.paymentTerms.disable();
          }
        })
    );
    // RECALCULATE LINE ITEM TOTAL WHEN LINE ITEMS CHANGE
    this.subscriptions.add(this.lineItems.valueChanges.subscribe(
      () => this.calculateLineItemNetAmount()));
    this.subscriptions.add(this.companyCode.valueChanges.subscribe(
      () => this.forceValueToUpperCase(this.companyCode)));
    this.subscriptions.add(this.vendorNumber.valueChanges.subscribe(
      () => this.forceValueToUpperCase(this.vendorNumber)));
    this.subscriptions.add(this.externalInvoiceNumber.valueChanges.subscribe(
      () => this.forceValueToUpperCase(this.externalInvoiceNumber))
    );
    this.isInvoiceAmountValid = true;
  }

  destroy() {
    this.subscriptions.unsubscribe();
  }

  public establishTouchLink(a: AbstractControl, b: AbstractControl): void {
    this.subscriptions.add(
      a.valueChanges.subscribe(() => {
        if (b.untouched) {
          b.markAsTouched();
          this.forceValueChangeEvent(b);
        }
      })
    );
  }

  public forceValueChangeEvent(control: AbstractControl): void {
    control.setValue(control instanceof UntypedFormGroup ? (control as UntypedFormGroup).getRawValue() : control.value);
  }

  public forceValueToUpperCase(control: AbstractControl): void {
    control.setValue(isFalsey(control.value) ? control.value : control.value.toUpperCase(), {emitEvent: false});
  }

  public lineItemCompanyCode(index: number): UntypedFormControl {
    return this.lineItemGroup(index).controls.companyCode as UntypedFormControl;
  }

  public lineItemCostCenter(index: number): UntypedFormControl {
    return this.lineItemGroup(index).controls.costCenter as UntypedFormControl;
  }

  public lineItemGlAccount(index: number): UntypedFormControl {
    return this.lineItemGroup(index).controls.glAccount as UntypedFormControl;
  }

  public lineItemNetAmount(index: number): UntypedFormControl {
    return this.lineItemGroup(index).controls.lineItemNetAmount as UntypedFormControl;
  }

  public lineItemNotes(index: number): UntypedFormControl {
    return this.lineItemGroup(index).controls.notes as UntypedFormControl;
  }

  public lineItemGroup(index: number): UntypedFormGroup {
    return this.lineItems.at(index) as UntypedFormGroup;
  }

  public removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
  }

  public addNewEmptyLineItem(): void {
    this.lineItems.push(this.createEmptyLineItemGroup());
    this.lineItems.markAsDirty();
  }

  public createEmptyLineItemGroup(): UntypedFormGroup {
    const companyCode = new UntypedFormControl(null, {
      validators: Validators.compose([pattern(this.allowedCharacters)]),
      asyncValidators: Validators.composeAsync([this.validateCompanyCode()]), updateOn: 'blur'
    });
    const costCenter = new UntypedFormControl(null, [required, pattern(this.allowedCharacters)]);
    this.establishTouchLink(costCenter, companyCode);
    const glAccount = new UntypedFormControl(null, [required, pattern(this.allowedCharacters)]);
    this.establishTouchLink(glAccount, costCenter);
    const lineItemNetAmount = new UntypedFormControl('0', [required, this.validateInvoiceNetAmount()]);
    this.establishTouchLink(lineItemNetAmount, glAccount);
    const notes = new UntypedFormControl(null);
    this.establishTouchLink(notes, lineItemNetAmount);
    this.subscriptions.add(companyCode.valueChanges.subscribe(
      () => this.forceValueToUpperCase(companyCode)));
    this.subscriptions.add(costCenter.valueChanges.subscribe(
      () => this.forceValueToUpperCase(costCenter)));
    this.subscriptions.add(glAccount.valueChanges.subscribe(
      () => this.forceValueToUpperCase(glAccount)));
    this.subscriptions.add(notes.valueChanges.subscribe(
      () => this.forceValueToUpperCase(notes)));
    return new UntypedFormGroup({companyCode, costCenter, glAccount, lineItemNetAmount, notes});
  }

  public calculateLineItemNetAmount(): void {
    this.totalLineItemNetAmount = 0;
    for (const control of this.lineItems.controls) {
      const lineItemGroup = (control as UntypedFormGroup);
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
