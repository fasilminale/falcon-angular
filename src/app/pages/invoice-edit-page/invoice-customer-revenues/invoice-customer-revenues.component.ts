import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { InvoiceCustomerRevenueDetail } from 'src/app/models/invoice/invoice-customer-revenue-detail.model';
import { Revenue } from 'src/app/models/invoice/revenue.model';

@Component({
  selector: 'app-invoice-customer-revenues',
  templateUrl: './invoice-customer-revenues.component.html',
  styleUrls: ['./invoice-customer-revenues.component.scss']
})
export class InvoiceCustomerRevenuesComponent implements OnInit {

  _formGroup = new UntypedFormGroup({});
  totalBAXAmount? = 0;
  totalRevenueAmountError = false;

  public totalRevenueAmount = new UntypedFormControl({});
  public invoiceBAXCustomerRevenues = new UntypedFormArray([]);
  public invoiceBDCustomerRevenues = new UntypedFormArray([]);

  private loadCustomerRevenueDetailsSubscription = new Subscription();

  constructor() {
    // empty
   }

   ngOnInit(): void {
     this.formGroup = this._formGroup;
     this.formGroup.disable();
   }

  @Input() set formGroup(givenFormGroup: UntypedFormGroup) {
    givenFormGroup.setControl('totalRevenueAmount', this.totalRevenueAmount);
    givenFormGroup.setControl('invoiceBAXCustomerRevenues', this.invoiceBAXCustomerRevenues);
    givenFormGroup.setControl('invoiceBDCustomerRevenues', this.invoiceBDCustomerRevenues);
    this._formGroup = givenFormGroup;
  }

  get formGroup(): UntypedFormGroup {
    return this._formGroup;
  }

  @Input() set loadCustomerRevenueDetails(observable: Observable<InvoiceCustomerRevenueDetail>) {
    this.loadCustomerRevenueDetailsSubscription.unsubscribe();
    this.loadCustomerRevenueDetailsSubscription = (observable.subscribe(t => {
      this.totalRevenueAmount.setValue(t.totalRevenueAmount ?? 0);
      this._formGroup.setControl('totalRevenueAmount', this.totalRevenueAmount);

      this.invoiceBAXCustomerRevenues.clear();
      let baxRevenue: Revenue = t.revenues.find((revenue) => revenue.customer === 'BAX')!;
      if (baxRevenue?.rate?.lineItems) {
        this.totalBAXAmount = this.mapCustomerRevenueView(baxRevenue, this.invoiceBAXCustomerRevenues);
      }
    }));
  }

  get baxCustomerRevenueControls(): AbstractControl[] {
    return this._formGroup.get('invoiceBAXCustomerRevenues') ? (this._formGroup.get('invoiceBAXCustomerRevenues') as UntypedFormArray).controls : new UntypedFormArray([]).controls;
  }

  private mapCustomerRevenueView(revenue: Revenue, formArray: UntypedFormArray) {
    let lineItemsTotal: number = 0;
    revenue.rate.lineItems.forEach((lineItem, index) => {
      const invoiceCustomerRevenueFormGroup = new UntypedFormGroup({
        customerCategory: new UntypedFormControl(revenue.customer),
        revenueDescription: new UntypedFormControl(lineItem.description ?? undefined),
        rate: new UntypedFormControl(lineItem.rate ?? lineItem.runningTotal ?? undefined),
        rateType: new UntypedFormControl(lineItem.rateType ?? undefined),
        quantity: new UntypedFormControl(lineItem.quantity ?? undefined),
        lineItemTotal: new UntypedFormControl(lineItem.lineItemTotal ?? undefined),
      });
      let lineTotal = parseFloat(lineItem.lineItemTotal);
      lineItemsTotal = lineTotal + lineItemsTotal;
      this.totalRevenueAmountError = this.totalRevenueAmountError || isNaN(lineTotal) || lineTotal == 0;
      formArray.push(invoiceCustomerRevenueFormGroup);
    });
    formArray.disable();
    return lineItemsTotal;
  }
}
