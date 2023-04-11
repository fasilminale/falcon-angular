import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceCustomerRevenuesComponent } from './invoice-customer-revenues.component';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { InvoiceCustomerRevenueDetail } from 'src/app/models/invoice/invoice-customer-revenue-detail.model';

describe('InvoiceCustomerRevenuesComponent', () => {
  let component: InvoiceCustomerRevenuesComponent;
  let fixture: ComponentFixture<InvoiceCustomerRevenuesComponent>;

  const testCustomerRevenueDetails = new UntypedFormGroup( {
    totalRevenueAmount: new UntypedFormControl('300.00'),
    invoiceBAXCustomerRevenues: new UntypedFormArray([
      new UntypedFormGroup({
        customerCategory: new UntypedFormControl('BAX'),
        revenueDescription: new UntypedFormControl("Description"),
        rate: new UntypedFormControl("300.00"),
        rateType: new UntypedFormControl("WEIGHT"),
        quantity: new UntypedFormControl(1),
        lineItemTotal:  new UntypedFormControl("300.00")
      })
    ])
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceCustomerRevenuesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceCustomerRevenuesComponent);
    component = fixture.componentInstance;
    component.totalRevenueAmount = new UntypedFormControl(0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form control', () => {
    component.invoiceBAXCustomerRevenues = testCustomerRevenueDetails.get('invoiceBAXCustomerRevenues') as UntypedFormArray;
    component.formGroup = testCustomerRevenueDetails;

    expect(component._formGroup.get('invoiceBAXCustomerRevenues')).toBeDefined();
    const customerRevenue = component.baxCustomerRevenueControls[0];
    expect(customerRevenue.get('customerCategory')).toBeDefined();
    expect(customerRevenue.get('revenueDescription')).toBeDefined();
    expect(customerRevenue.get('rate')).toBeDefined();
    expect(customerRevenue.get('rateType')).toBeDefined();
    expect(customerRevenue.get('quantity')).toBeDefined();
    expect(customerRevenue.get('lineItemTotal')).toBeDefined();
  });

  describe('when invoice allocation detail is updated', () => {
    let loadCustomerRevenueDetails$: Subject<InvoiceCustomerRevenueDetail>;
    beforeEach(() => {
      loadCustomerRevenueDetails$ = new Subject();
      component.loadCustomerRevenueDetails = loadCustomerRevenueDetails$.asObservable();
    });

    it('should load BAX customer revenues form', done => {
      loadCustomerRevenueDetails$.subscribe(() => {
        expect(component._formGroup).toBeDefined();
        done();
      });
      loadCustomerRevenueDetails$.next({
        totalRevenueAmount: 300.00,
        revenues: [{
          customer: "BAX",
          rate: {
            accessorialList: [],
            lineItems: [{
              description: "Description",
              rate: '',
              rateType: "WEIGHT",
              runningTotal: "300.00",
              lineItemTotal: "300.00",
              lineItemType: "LineType",
              step: '',
              quantity: 1,
              costName: '',
              accessorial: false,
              message: ''
            }]
          }
        }]
      });
    });

    it('should load BAX customer revenues form with missing values', done => {
      loadCustomerRevenueDetails$.subscribe(() => {
        expect(component._formGroup).toBeDefined();
        done();
      });
      loadCustomerRevenueDetails$.next({
        totalRevenueAmount: 300.00,
        revenues: [{
          customer: "BAX",
          rate: {
            accessorialList: [],
            lineItems: []
          }
        }]
      });
    });
  });

});
