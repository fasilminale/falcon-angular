import {Injectable} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {filter} from 'rxjs/operators';
import {isFalsey} from '../../utils/predicates';
import {FalRadioOption} from '../fal-radio-input/fal-radio-input.component';
import {SubscriptionManager} from '../../services/subscription-manager';

@Injectable()
export class InvoiceFormManager {

  /* INVOICE FORM GROUP */
  public readonly invoiceFormGroup: FormGroup;
  public readonly workType: FormControl;
  public readonly companyCode: FormControl;
  public readonly erpType: FormControl;
  public readonly vendorNumber: FormControl;
  public readonly externalInvoiceNumber: FormControl;
  public readonly invoiceDate: FormControl;
  public readonly amountOfInvoice: FormControl;
  public readonly currency: FormControl;
  public readonly comments: FormControl;
  public readonly lineItems: FormArray;

  /* OVERRIDE PAYMENT TERMS FORM GROUP */
  public readonly osptFormGroup: FormGroup;
  public readonly isPaymentOverrideSelected: FormControl;
  public readonly paymentTerms: FormControl;

  /* MISC FORM CONTROLS */
  public readonly selectedTemplateFormControl: FormControl;

  /* VALUE OPTIONS */
  // TODO replace these with calls to the backend?
  public workTypeOptions = ['Indirect Non-PO Invoice'];
  public erpTypeOptions = ['Pharma Corp', 'TPM'];
  public currencyOptions = ['USD', 'CAD'];
  public myTemplateOptions: Array<string> = [];
  public paymentTermOptions: Array<FalRadioOption> = [
    {value: 'Z000', display: 'Pay Immediately'},
    {value: 'ZN14', display: 'Pay in 14 days'}
  ];

  constructor(private subscriptionManager: SubscriptionManager) {
    this.workType = new FormControl({value: null}, [required]);
    this.companyCode = new FormControl({value: null}, [required]);
    this.erpType = new FormControl({value: null}, [required]);
    this.vendorNumber = new FormControl({value: null}, [required]);
    this.externalInvoiceNumber = new FormControl({value: null}, [required]);
    this.invoiceDate = new FormControl({value: null}, [required, validateDate]);
    this.amountOfInvoice = new FormControl({value: 0}, [required]);
    this.currency = new FormControl({value: null}, [required]);
    this.isPaymentOverrideSelected = new FormControl({value: false});
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
    });
    this.selectedTemplateFormControl = new FormControl({
      value: null,
      disabled: (this.myTemplateOptions.length === 0)
    });
  }

  public init(): void {
    this.invoiceFormGroup.enable();
    this.isPaymentOverrideSelected.enable();
    this.selectedTemplateFormControl.enable();
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
      this.isPaymentOverrideSelected.valueChanges
        .pipe(filter(isFalsey))
        .subscribe(() => this.paymentTerms.reset())
    );
  }

  public establishTouchLink(a: AbstractControl, b: AbstractControl): void {
    this.subscriptionManager.manage(
      a.statusChanges.subscribe(() => {
        if (b.untouched) {
          b.markAsTouched();
          this.forceValueChangeEvent(b);
        }
      })
    );
  }

  public forceValueChangeEvent(control: AbstractControl): void {
    control.setValue(control.value);
  }

  public createEmptyLineItemGroup(): FormGroup {
    const companyCode = new FormControl(null);
    const costCenter = new FormControl(null, [required]);
    this.establishTouchLink(costCenter, companyCode);
    const glAccount = new FormControl(null, [required]);
    this.establishTouchLink(glAccount, costCenter);
    const lineItemNetAmount = new FormControl('0', [required]);
    this.establishTouchLink(lineItemNetAmount, glAccount);
    const notes = new FormControl(null);
    this.establishTouchLink(notes, lineItemNetAmount);
    return new FormGroup({companyCode, costCenter, glAccount, lineItemNetAmount, notes});
  }

}

/* VALIDATORS */
const {required} = Validators;

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
