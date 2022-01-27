import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { FalRadioOption } from 'src/app/components/fal-radio-input/fal-radio-input.component';
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
 
  public paymentTermOptions: Array<FalRadioOption> = [
    {value: 'Z000', display: 'Pay Immediately'},
    {value: 'ZN14', display: 'Pay in 14 days'}
  ];

  public currencyOptions = ['USD', 'CAD'];
  //nc
  public costBreakdownTypes = [
    {display: 'Per hour', value: 'perHour'}, 
    {display: 'Flat', value: 'flat'}, 
    {display: 'Per mile', value: 'perMile'}, 
    {display: 'N/A', value: ''}];

    totalInvoiceAmount = 0;
    //nc

  overridePaymentTermsFormGroup  = new FormGroup({
    isPaymentOverrideSelected: new FormControl(false),
    paymentTerms: new FormControl('')
  });

  readOnlyForm = true;

  costBreakdownItems = new FormArray([]); //nc

  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => this.readOnlyForm = !isEditMode
    ));
  }


  @Input() set formGroup(givenFormGroup: FormGroup) {
    givenFormGroup.setControl('amountOfInvoice', new FormControl(''));
    givenFormGroup.setControl('currency', new FormControl(''));
    givenFormGroup.setControl('overridePaymentTerms', this.overridePaymentTermsFormGroup);
    givenFormGroup.setControl('paymentTerms', new FormControl(''));
    givenFormGroup.setControl('mileage', new FormControl());
    this.insertBreakDownItems(); //nc
    givenFormGroup.setControl('costBreakdownItems', this.costBreakdownItems); 
    //nc
    this._formGroup = givenFormGroup;
    this.updateTotalInvoiceAmount(); //nc

  }

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) { }

  ngOnInit(): void {
  }

  //*nc starts
  insertBreakDownItems() {
    this.costBreakdownItems.controls.push(new FormGroup({
        charge: new FormControl('Fuel'),
        rate: new FormControl(),
        type: new FormControl(),
        quantity: new FormControl(),
        totalAmount: new FormControl(300)
    }));
    this.costBreakdownItems.controls.push(new FormGroup({
      charge: new FormControl('Accessorial'),
      rate: new FormControl(),
      type: new FormControl(),
      quantity: new FormControl(),
      totalAmount: new FormControl(500)
  }));
  //this.updateTotalInvoiceAmount();
  }

  get costBreakdownItemsControls() {
    return this._formGroup.get('costBreakdownItems') ? (this._formGroup.get('costBreakdownItems') as FormArray).controls: new FormArray([]).controls;
  }

  updateTotalInvoiceAmount(){
    this.totalInvoiceAmount=  0;
    this.costBreakdownItemsControls.forEach(item =>{
      const totalAmount  = item.get('totalAmount')?.value;
      if(!isNaN(parseFloat(totalAmount))) {
        this.totalInvoiceAmount += parseFloat(totalAmount.toFixed(2));
      }
    })
  }

  //* nc ends

}
