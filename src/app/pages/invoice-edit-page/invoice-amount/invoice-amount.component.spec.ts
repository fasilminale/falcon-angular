import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { InvoiceAmountDetail } from 'src/app/models/invoice/invoice-amount-detail-model';
import { FalconTestingModule } from 'src/app/testing/falcon-testing.module';

import { InvoiceAmountComponent } from './invoice-amount.component';

describe('InvoiceAmountComponent', () => {
  let component: InvoiceAmountComponent;
  let fixture: ComponentFixture<InvoiceAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ InvoiceAmountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form control', () => {
    component.formGroup = new FormGroup({});
    expect(component._formGroup.get('amountOfInvoice')).toBeDefined();
    expect(component._formGroup.get('currency')).toBeDefined();
    expect(component._formGroup.get('mileage')).toBeDefined();
    expect(component._formGroup.get('paymentTerms')).toBeDefined();
    expect(component._formGroup.get('overridePaymentTerms')).toBeDefined();

  });

  describe('when edit mode is updated', () => {
    let isEditMode$: Subject<boolean>;
    beforeEach(() => {
      isEditMode$ = new Subject();
      component.updateIsEditMode$ = isEditMode$.asObservable();
    });

    it('(edit mode = true) should enable editable forms', done => {
      isEditMode$.subscribe(() => {
        expect(component.readOnlyForm).toBeFalse();
        done();
      });
      isEditMode$.next(true);
    });
    it('(edit mode = false) should disable editable forms', done => {
      isEditMode$.subscribe(() => {
        expect(component.readOnlyForm).toBeTrue();
        done();
      });
      isEditMode$.next(false);
    });
  });


  describe('when invoice amount detail is loaded', () => {
    let loadInvoiceAmountDetail$: Subject<InvoiceAmountDetail>;
    beforeEach(() => {
      loadInvoiceAmountDetail$ = new Subject();
      component.formGroup = new FormGroup({});
      component.loadInvoiceAmountDetail$ = loadInvoiceAmountDetail$.asObservable();
    });

    it('should populate form with invoice amount details', done => {
      loadInvoiceAmountDetail$.subscribe(() => {
        const formGroupValue = component._formGroup.value;

        expect(formGroupValue.currency).toBe('USD');
        expect(formGroupValue.amountOfInvoice).toBe('1000');
        expect(formGroupValue.overridePaymentTerms.isPaymentOverrideSelected).toBe(true);
        expect(formGroupValue.overridePaymentTerms.paymentTerms).toBe('TestTerms');
        expect(formGroupValue.mileage).toBe('100');
        done();
      });
      loadInvoiceAmountDetail$.next({
        currency: 'USD',
        amountOfInvoice: '1000',
        costLineItems: [
          {
            chargeCode: 'TestChargeCode',
            chargeLineTotal: 100,
            rateAmount: 100,
            rateType: 'FLAT',
            quantity: 1,
            costName: 'TestCostName'

          }
        ],
        standardPaymentTermsOverride: 'TestTerms',
        mileage: '100'
      });
    });

    it('should not populate form when no invoice amount details', done => {
      loadInvoiceAmountDetail$.subscribe(() => {
        const formGroupValue = component._formGroup.value;

        expect(formGroupValue.currency).toBe('');
        expect(formGroupValue.amountOfInvoice).toBe('');
        expect(formGroupValue.overridePaymentTerms.isPaymentOverrideSelected).toBe(false);
        expect(formGroupValue.overridePaymentTerms.paymentTerms).toBe('');
        expect(formGroupValue.mileage).toBe('');
        done();
      });
      loadInvoiceAmountDetail$.next({} as InvoiceAmountDetail);
    });

    it('should not populate form when no invoice amount details', done => {
      loadInvoiceAmountDetail$.subscribe(() => {
        const formGroupValue = component._formGroup.value;

        expect(formGroupValue.currency).toBe('');
        expect(formGroupValue.amountOfInvoice).toBe('');
        expect(formGroupValue.overridePaymentTerms.isPaymentOverrideSelected).toBe(false);
        expect(formGroupValue.overridePaymentTerms.paymentTerms).toBe('');
        expect(formGroupValue.mileage).toBe('');
        done();
      });
      loadInvoiceAmountDetail$.next(undefined);
    });
  });

});
