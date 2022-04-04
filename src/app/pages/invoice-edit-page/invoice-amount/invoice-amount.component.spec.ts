import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {CostLineItem} from 'src/app/models/line-item/line-item-model';
import {FalconTestingModule} from 'src/app/testing/falcon-testing.module';
import { InvoiceOverviewDetail } from 'src/app/models/invoice/invoice-overview-detail.model';

import {InvoiceAmountComponent} from './invoice-amount.component';
import {RateEngineResponse} from '../../../models/rate-engine/rate-engine-request';

describe('InvoiceAmountComponent', () => {
  let component: InvoiceAmountComponent;
  let fixture: ComponentFixture<InvoiceAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [InvoiceAmountComponent]
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

  describe('get totalCostBreakdownAmount', () => {
    it('should get totalCostBreakdownAmount as zero', () => {
      expect(component.costBreakdownTotal).toBe(0);
    });

    it('should get totalCostBreakdownAmount as total', () => {
      component._formGroup = new FormGroup({
        amountOfInvoice: new FormControl(10),
        costBreakdownItems: new FormArray([new FormGroup({
          totalAmount: new FormControl(10),
        }),
          new FormGroup({
            totalAmount: new FormControl()
          })
        ])
      });
      expect(component.costBreakdownTotal).toBe(10);
    });
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

  describe('when edit mode is updated', () => {
    let chargeLineItemOptions$: Subject<RateEngineResponse>;
    const accessorialDetailResponse = {
      mode: 'TL',
      scac: 'OWEL',
      shipDate: '2022-04-02',
      origin: {
        streetAddress: '392 Poling Farm Road',
        locCode: '',
        city: 'Norfolk',
        state: 'NE',
        zip: '68701',
        country: 'US'
      },
      destination: {
        streetAddress: '4018 Murphy Court',
        locCode: '',
        city: 'Riverside',
        state: 'CA',
        zip: '92507',
        country: 'US'
      },
      calcDetails: [
        {
          accessorialCode: '405',
          name: 'Fuel Surcharge - Miles'
        }
      ]
    };

    beforeEach(() => {
      chargeLineItemOptions$ = new Subject();
      component.chargeLineItemOptions$ = chargeLineItemOptions$.asObservable();
    });

    it('should populate cost breakdown charge options', done => {

      chargeLineItemOptions$.subscribe(() => {
        expect(component.costBreakdownOptions.length).toBeGreaterThan(1);
        done();
      });
      chargeLineItemOptions$.next(accessorialDetailResponse);
    });

    it ('should not display charge options already in list', done => {
      component._formGroup = new FormGroup({
        amountOfInvoice: new FormControl(10),
        costBreakdownItems: new FormArray([new FormGroup({
            charge: new FormControl('Fuel Surcharge - Miles'),
          })
        ])
      });

      chargeLineItemOptions$.subscribe(() => {
        expect(component.costBreakdownOptions.length).toEqual(1);
        done();
      });
      chargeLineItemOptions$.next(accessorialDetailResponse);
    });
  });


  describe('when invoice amount detail is loaded', () => {
    let loadInvoiceAmountDetail$: Subject<InvoiceAmountDetail>;
    let loadInvoiceOverviewDetail$: Subject<InvoiceOverviewDetail>;
    beforeEach(() => {
      loadInvoiceAmountDetail$ = new Subject();
      component.formGroup = new FormGroup({});
      component.loadInvoiceAmountDetail$ = loadInvoiceAmountDetail$.asObservable();
    });
    beforeEach(() => {
      loadInvoiceOverviewDetail$ = new Subject();
      component.loadInvoiceOverviewDetail$ = loadInvoiceOverviewDetail$.asObservable();
    });

    it('should populate form with invoice amount details', done => {
      loadInvoiceAmountDetail$.subscribe(() => {
        const formGroupValue = component._formGroup.value;

        expect(formGroupValue.currency).toBe('USD');
        expect(formGroupValue.amountOfInvoice).toBe('1000');
        expect(formGroupValue.overridePaymentTerms.isPaymentOverrideSelected).toEqual(['override']);
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
            rateSource: {key: 'CONTRACT', label: 'Contract'},
            entrySource: {key: 'AUTO', label: 'AUTO'},
            chargeLineTotal: 100,
            rateAmount: 100,
            rateType: 'FLAT',
            quantity: 1,
            costName: 'TestCostName',
            message: '',
            manual: false
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
        expect(formGroupValue.overridePaymentTerms.isPaymentOverrideSelected).toEqual([]);
        expect(formGroupValue.overridePaymentTerms.paymentTerms).toBe('');
        expect(formGroupValue.mileage).toBe('');
        done();
      });
      loadInvoiceAmountDetail$.next({costLineItems: [{} as CostLineItem]} as InvoiceAmountDetail);
    });

    it('should set isPrepaid to True', done => {
      loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.isPrepaid).toBeTrue();
        done();
      });
     loadInvoiceOverviewDetail$.next({freightPaymentTerms: 'PREPAID'} as InvoiceOverviewDetail);
    });

    it('should set isPrepaid to False', done => {
      loadInvoiceOverviewDetail$.subscribe(() => {
        expect(component.isPrepaid).toBeFalse();
        done();
      });
      loadInvoiceOverviewDetail$.next({freightPaymentTerms: 'COLLECT'} as InvoiceOverviewDetail);
    });

    it('should not populate form when no invoice amount details when form group has no fields set', done => {
      component._formGroup = new FormGroup({costBreakdownItems: new FormArray([])});
      loadInvoiceAmountDetail$.subscribe(() => {
        expect(component._formGroup.value).toEqual({
          costBreakdownItems: []
        });
        done();
      });
      loadInvoiceAmountDetail$.next({costLineItems: [{} as CostLineItem]} as InvoiceAmountDetail);
    });

    it('should not populate form when no invoice amount details', done => {
      loadInvoiceAmountDetail$.subscribe(() => {
        const formGroupValue = component._formGroup.value;

        expect(formGroupValue.currency).toBe('');
        expect(formGroupValue.amountOfInvoice).toBe('');
        expect(formGroupValue.overridePaymentTerms.isPaymentOverrideSelected).toEqual([]);
        expect(formGroupValue.overridePaymentTerms.paymentTerms).toBe('');
        expect(formGroupValue.mileage).toBe('');
        done();
      });
      loadInvoiceAmountDetail$.next(undefined);
    });

    it('should reset payment terms when override payment terms checkbox unchecked', done => {
      loadInvoiceAmountDetail$.next({
        currency: 'USD',
        amountOfInvoice: '1000',
        costLineItems: [
          {
            chargeCode: 'TestChargeCode',
            rateSource: {key: 'CONTRACT', label: 'Contract'},
            entrySource: {key: 'AUTO', label: 'AUTO'},
            chargeLineTotal: 100,
            rateAmount: 100,
            rateType: 'FLAT',
            quantity: 1,
            costName: 'TestCostName',
            message: '',
            manual: false
          }
        ],
        standardPaymentTermsOverride: 'TestTerms',
        mileage: '100'
      });
      expect(component.overridePaymentTermsFormGroup.controls.paymentTerms.value).toEqual('TestTerms');
      component.isPaymentOverrideSelected.at(0).setValue(null);
      expect(component.overridePaymentTermsFormGroup.controls.paymentTerms.value).toBeNull();
      done();
    });

    describe('when an empty line item is added', () => {
      beforeEach(() => {
        component.addNewEmptyLineItem();
      });
      it('should now have 1 line item', () => {
        expect(component.costBreakdownItems.length).toEqual(1);
      });
    });

    it('should disable overrideStandardPaymentTerms checkbox when enableDisableOverrideStandardPaymentTerms invoked with true', () => {

      component.overridePaymentTermsOptions[0].disabled = false;
      component.enableDisableOverrideStandardPaymentTerms(true);
      expect(component.overridePaymentTermsOptions[0].disabled).toBeTrue();
    });

    it('should disable currency radios when enableDisableCurrency invoked with true', () => {

      component._formGroup.controls.currency.enable();
      expect(component._formGroup.controls.currency.disabled).toBeFalse();
      component.enableDisableCurrency(true);
      expect(component._formGroup.controls.currency.disabled).toBeTrue();
    });

    it('should enable currency radios when enableDisableCurrency invoked with false', () => {

      component._formGroup.controls.currency.disable();
      expect(component._formGroup.controls.currency.disabled).toBeTrue();
      component.enableDisableCurrency(false);
      expect(component._formGroup.controls.currency.disabled).toBeFalse();
    });

  });

});
