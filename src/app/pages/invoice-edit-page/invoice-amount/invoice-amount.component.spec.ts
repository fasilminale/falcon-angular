import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UntypedFormArray, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {Observable, of, Subject} from 'rxjs';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {FalconTestingModule} from 'src/app/testing/falcon-testing.module';
import {InvoiceOverviewDetail} from 'src/app/models/invoice/invoice-overview-detail.model';
import {InvoiceAmountComponent} from './invoice-amount.component';
import {
  CalcDetail,
  CostBreakDownUtils,
  RateDetailResponse,
} from '../../../models/rate-engine/rate-engine-request';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {CommentModalData, CommentModel, UtilService} from '../../../services/util-service';
import {ConfirmationModalData} from '@elm/elm-styleguide-ui';
import {
  EditChargeModalInput,
  FalEditChargeModalComponent,
  NewChargeModalOutput
} from '../../../components/fal-edit-charge-modal/fal-edit-charge-modal.component';
import {asSpy} from '../../../testing/test-utils.spec';

describe('InvoiceAmountComponent', () => {

  const TEST_VARIABLE_NAME = 'Test Variable';
  const TEST_CALC_DETAIL: CalcDetail = {
    accessorialCode: 'TEST',
    name: 'Test Calc Detail',
    variables: [
      {
        variable: TEST_VARIABLE_NAME,
        quantity: 0
      }
    ]
  };
  const TEST_CALC_DETAIL_OPTION = CostBreakDownUtils.toOption(TEST_CALC_DETAIL);

  const TEST_CALC_DETAIL_TWO: CalcDetail = {
    accessorialCode: 'TWO',
    name: 'Test Calc Detail Two',
    variables: [
      {
        variable: TEST_VARIABLE_NAME,
        quantity: 0
      }
    ]
  };
  const TEST_CALC_DETAIL_OPTION_TWO = CostBreakDownUtils.toOption(TEST_CALC_DETAIL_TWO);

  const OTHER_CALC_DETAIL = {
    name: 'OTHER',
    accessorialCode: 'OTHER',
    variables: [
      {
        variable: 'Amount',
        quantity: 0.00
      }
    ]
  };
  const OTHER_CALC_DETAIL_OPTION = CostBreakDownUtils.toOption(OTHER_CALC_DETAIL);

  const TEST_MODAL_DATA: ConfirmationModalData = {
    title: 'title',
    innerHtmlMessage: '',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel'
  };

  let component: InvoiceAmountComponent;
  let fixture: ComponentFixture<InvoiceAmountComponent>;
  let utilService: UtilService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      providers: [{
        provide: UtilService, useValue: {
          openNewChargeModal: (data: EditChargeModalInput): Observable<NewChargeModalOutput> => {
            throw new Error('Spy On this function instead!');
          },
          openEditChargeModal: FalEditChargeModalComponent,
          openCommentModal: (data: CommentModalData): Observable<CommentModel> => {
            return of({comment: ''});
          }
        }
      }],
      declarations: [InvoiceAmountComponent],
    }).compileComponents();
    utilService = TestBed.inject(UtilService);
    fixture = TestBed.createComponent(InvoiceAmountComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form control', () => {
    expect(component._formGroup.get('amountOfInvoice')).toBeDefined();
    expect(component._formGroup.get('currency')).toBeDefined();
    expect(component._formGroup.get('mileage')).toBeDefined();
    expect(component._formGroup.get('paymentTerms')).toBeDefined();
    expect(component._formGroup.get('overridePaymentTerms')).toBeDefined();
  });

  describe('Cost Breakdown / Rate Totals', () => {
    it('should default costBreakdownTotal as zero', () => {
      expect(component.costBreakdownTotal).toBe(0);
    });
    it('should default contractedRateTotal as zero', () => {
      expect(component.contractedRateTotal).toBe(0);
    });
    it('should default nonContractedRateTotal as zero', () => {
      expect(component.nonContractedRateTotal).toBe(0);
    });
    describe('> After Adding Line Items', () => {
      beforeEach(() => {
        component.amountOfInvoiceControl.setValue(30);
        component.costBreakdownItems.push(new UntypedFormGroup({
          totalAmount: new UntypedFormControl(10),
          rateSource: new UntypedFormControl('Contract')
        }));
        component.costBreakdownItems.push(new UntypedFormGroup({
          totalAmount: new UntypedFormControl(20),
          rateSource: new UntypedFormControl('Manual')
        }));
        component.costBreakdownItems.push(new UntypedFormGroup({
          totalAmount: new UntypedFormControl(),
          rateSource: new UntypedFormControl('Manual')
        }));
      });
      it('should get costBreakdownTotal as total', () => {
        expect(component.costBreakdownTotal).toBe(30);
      });
      it('should get contractedRateTotal as total', () => {
        expect(component.contractedRateTotal).toBe(10);
      });
      it('should get nonContractedRateTotal as total', () => {
        expect(component.nonContractedRateTotal).toBe(20);
      });
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
    let chargeLineItemOptions$: Subject<RateDetailResponse>;
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
      component.costBreakdownOptions$.value.push({
        label: 'Fuel Surcharge - Miles',
        value: {
          accessorialCode: '405',
          name: 'Fuel Surcharge - Miles'
        }
      });
      // force an update because arrays don't trigger the value change event
      component.costBreakdownOptions$.value = component.costBreakdownOptions$.value;
    });

  });

  describe('when invoice amount detail is loaded', () => {
    let loadInvoiceAmountDetail$: Subject<InvoiceAmountDetail>;
    let loadInvoiceOverviewDetail$: Subject<InvoiceOverviewDetail>;
    beforeEach(() => {
      loadInvoiceAmountDetail$ = new Subject();
      component.formGroup = new UntypedFormGroup({});
      component.loadInvoiceAmountDetail$ = loadInvoiceAmountDetail$.asObservable();
    });
    beforeEach(() => {
      loadInvoiceOverviewDetail$ = new Subject();
      component.loadInvoiceOverviewDetail$ = loadInvoiceOverviewDetail$.asObservable();
    });

    it('should populate form with invoice amount details', done => {
      const control = component.createEmptyLineItemGroup();
      control.get('charge')?.setValue(TEST_CALC_DETAIL);
      control.get('totalAmount')?.setValue('78');

      component.costBreakdownItemsControls.push(control);

      loadInvoiceAmountDetail$.subscribe(() => {
        component._formGroup.controls.mileage.enable();
        const formGroupValue = component._formGroup.value;
        expect(formGroupValue.currency).toBe('USD');
        expect(formGroupValue.amountOfInvoice).toBe(1000);
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
            uid: 'TST',
            accessorialCode: 'TST',
            chargeCode: 'TestChargeCode',
            rateSource: {key: 'CONTRACT', label: 'Contract'},
            entrySource: {key: 'AUTO', label: 'AUTO'},
            chargeLineTotal: 100,
            rateAmount: 100,
            rateType: 'FLAT',
            quantity: 1,
            costName: 'TestCostName',
            requestStatus: {
              key: 'OPEN',
              label: 'Open'
            },
            createdBy: 'test@test.com',
            createdDate: '2022-04-25T00:05:00.000Z',
            carrierComment: 'test comment',
            rateResponse: 'Successful',
            closedBy: 'test@test.com',
            closedDate: '2022-04-26T00:05:00.000Z',
            responseComment: 'test',
            variables: [{
              variable: TEST_VARIABLE_NAME,
              quantity: 1
            }],
            attachment: {
              fileName: 'test.jpg',
              url: 'signedurl/test.jpg',
              type: 'Documentation',
              deleted: false,
              uploaded: true
            },
            step: '1',
            accessorial: true,
            autoApproved: false,
            attachmentRequired: false,
            attachmentLink: '',
            planned: false,
            fuel: false,
            message: '',
            manual: false,
            expanded: false,
            persisted: true,
          }
        ],
        pendingChargeLineItems: [{
          uid: '',
          chargeCode: 'TestCharge',
          rateSource: {key: 'CONTRACT', label: 'Contract'},
          entrySource: {key: 'AUTO', label: 'AUTO'},
          chargeLineTotal: 100,
          rateAmount: 100,
          rateType: 'FLAT',
          quantity: 1,
          costName: 'TestCostName',
          requestStatus: {
            key: 'OPEN',
            label: 'Open'
          },
          createdBy: 'test@test.com',
          createdDate: '2022-04-25T00:05:00.000Z',
          carrierComment: 'test comment',
          rateResponse: 'Successful',
          closedBy: 'test@test.com',
          closedDate: '2022-04-26T00:05:00.000Z',
          responseComment: 'test',
          attachment: {
            fileName: 'test.jpg',
            url: 'signedurl/test.jpg',
            type: 'Documentation',
            deleted: false,
            uploaded: true
          },
          step: '1',
          accessorial: true,
          autoApproved: false,
          attachmentRequired: false,
          attachmentLink: '',
          planned: false,
          fuel: false,
          message: '',
          manual: false,
          expanded: false,
          variables: [],
          persisted: true,
        }],
        deniedChargeLineItems: [],
        disputeLineItems: [
          {
            comment: 'test comment',
            attachment: 'test.jpg',
            createdDate: '2022-04-04',
            createdBy: 'test@test.com',
            closedDate: '2022-05-04',
            closedBy: 'test@test.com',
            responseComment: 'test comment',
            disputeStatus: {
              key: 'OPEN',
              label: 'Open'
            }
          }
        ],
        deletedChargeLineItems: [],
        standardPaymentTermsOverride: 'TestTerms',
        mileage: '100',
        returnToDomicile: false
      });
    });

    it('should not populate form when no invoice amount details', done => {
      loadInvoiceAmountDetail$.subscribe(() => {
        component._formGroup.controls.mileage.enable();
        const formGroupValue = component._formGroup.value;
        expect(formGroupValue.currency).toBe('');
        expect(formGroupValue.amountOfInvoice).toBe(0);
        expect(formGroupValue.overridePaymentTerms.isPaymentOverrideSelected).toEqual([]);
        expect(formGroupValue.overridePaymentTerms.paymentTerms).toBe('');
        expect(formGroupValue.mileage).toBe('');
        done();
      });
      loadInvoiceAmountDetail$.next({
        costLineItems: [{
          variables: []
        } as any],
        pendingChargeLineItems: [{
          variables: []
        } as any],
        disputeLineItems: [{
          variables: []
        } as any],
      } as InvoiceAmountDetail);
    });

    it('should enable currency fields for spot quote invoice.', done => {
      loadInvoiceOverviewDetail$.subscribe(() => {
      component.currencyOptions.forEach( (element) => {
          if(element.label === 'USD') {
            expect(element.disabled).toBeFalse();
          } else {
            expect(element.disabled).toBeTrue();
          }
      });
        done();
      });
      loadInvoiceOverviewDetail$.next({isSpotQuote: true} as InvoiceOverviewDetail);
    });

    it('should disable currency fields for non spot quote invoice.', done => {
      loadInvoiceOverviewDetail$.subscribe(() => {
        component.currencyOptions.forEach( (element) => {
          expect(element.disabled).toBeTrue();
        });
        done();
      });
      loadInvoiceOverviewDetail$.next({isSpotQuote: false} as InvoiceOverviewDetail);
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
      component._formGroup = new UntypedFormGroup(
        {
          costBreakdownItems: new UntypedFormArray([]),
          pendingChargeLineItems: new UntypedFormArray([]),
          deniedChargeLineItems: new UntypedFormArray([]),
          disputeLineItems: new UntypedFormArray([])
        }
      );
      loadInvoiceAmountDetail$.subscribe(() => {
        expect(component._formGroup.value).toEqual({
          costBreakdownItems: [],
          pendingChargeLineItems: [],
          deniedChargeLineItems: [],
          disputeLineItems: []
        });
        done();
      });
      loadInvoiceAmountDetail$.next({
        costLineItems: [{
          variables: []
        } as any],
        pendingChargeLineItems: [{
          variables: []
        } as any],
        disputeLineItems: [{
          variables: []
        } as any],
      } as InvoiceAmountDetail);
    });

    it('should not populate form when no invoice amount details', done => {
      loadInvoiceAmountDetail$.subscribe(() => {
        component._formGroup.controls.mileage.enable();
        const formGroupValue = component._formGroup.value;
        expect(formGroupValue.currency).toBe('');
        expect(formGroupValue.amountOfInvoice).toBe(0);
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
            uid: 'TST',
            accessorialCode: 'TST',
            chargeCode: 'TestChargeCode',
            rateSource: {key: 'CONTRACT', label: 'Contract'},
            entrySource: {key: 'AUTO', label: 'AUTO'},
            chargeLineTotal: 100,
            rateAmount: 100,
            rateType: 'FLAT',
            quantity: 1,
            costName: 'TestCostName',
            requestStatus: {
              key: 'OPEN',
              label: 'Open'
            },
            createdBy: 'test@test.com',
            createdDate: '2022-04-25T00:05:00.000Z',
            carrierComment: 'test comment',
            rateResponse: 'Successful',
            closedBy: 'test@test.com',
            closedDate: '2022-04-26T00:05:00.000Z',
            responseComment: 'test',
            attachment: {
              fileName: 'test.jpg',
              url: 'signedurl/test.jpg',
              type: 'Documentation',
              deleted: false,
              uploaded: true
            },
            step: '1',
            variables: [{
              variable: TEST_VARIABLE_NAME,
              quantity: 1
            }],
            accessorial: true,
            autoApproved: false,
            attachmentRequired: false,
            attachmentLink: '',
            planned: false,
            fuel: false,
            message: '',
            manual: false,
            expanded: false,
            persisted: true,
          }
        ],
        pendingChargeLineItems: [],
        deniedChargeLineItems: [],
        disputeLineItems: [],
        deletedChargeLineItems: [],
        standardPaymentTermsOverride: 'TestTerms',
        mileage: '100',
        returnToDomicile: false
      });
      expect(component.overridePaymentTermsFormGroup.controls.paymentTerms.value).toEqual('TestTerms');
      component.isPaymentOverrideSelected.at(0).setValue(null);
      expect(component.overridePaymentTermsFormGroup.controls.paymentTerms.value).toBeNull();
      done();
    });

    it('should reset payment terms when override payment terms checkbox unchecked and empty isPaymentOverrideSelected form array', done => {
      loadInvoiceAmountDetail$.next({
        currency: 'USD',
        amountOfInvoice: '1000',
        costLineItems: [
          {
            uid: 'TST',
            accessorialCode: 'TST',
            chargeCode: 'TestChargeCode',
            rateSource: {key: 'CONTRACT', label: 'Contract'},
            entrySource: {key: 'AUTO', label: 'AUTO'},
            chargeLineTotal: 100,
            rateAmount: 100,
            rateType: 'FLAT',
            quantity: 1,
            costName: 'TestCostName',
            requestStatus: {
              key: 'OPEN',
              label: 'Open'
            },
            createdBy: 'test@test.com',
            createdDate: '2022-04-25T00:05:00.000Z',
            carrierComment: 'test comment',
            rateResponse: 'Successful',
            closedBy: 'test@test.com',
            closedDate: '2022-04-26T00:05:00.000Z',
            responseComment: 'test',
            attachment: {
              fileName: 'test.jpg',
              url: 'signedurl/test.jpg',
              type: 'Documentation',
              deleted: false,
              uploaded: true
            },
            step: '1',
            variables: [{
              variable: TEST_VARIABLE_NAME,
              quantity: 1
            }],
            accessorial: true,
            autoApproved: false,
            attachmentRequired: false,
            attachmentLink: '',
            planned: false,
            fuel: false,
            message: '',
            manual: false,
            expanded: false,
            persisted: true,
          }
        ],
        pendingChargeLineItems: [],
        deniedChargeLineItems: [],
        disputeLineItems: [],
        deletedChargeLineItems: [],
        standardPaymentTermsOverride: 'TestTerms',
        mileage: '100',
        returnToDomicile: false
      });
      expect(component.overridePaymentTermsFormGroup.controls.paymentTerms.value).toEqual('TestTerms');
      component.isPaymentOverrideSelected.clear();
      expect(component.overridePaymentTermsFormGroup.controls.isPaymentOverrideSelected.value).toEqual([]);
      done();
    });

    it('should call acceptCharge and add the line item to cost breakdown charges', async (done) => {
      component.pendingChargeLineItems.push(new UntypedFormGroup({
        charge: new UntypedFormControl('Charge'),
        requestStatus: new UntypedFormControl('Successful'),
        responseComment: new UntypedFormControl('N/A'),
        closedDate: new UntypedFormControl('N/A'),
        closedBy: new UntypedFormControl('N/A')
      }));
      component.costBreakdownItems.push(new UntypedFormGroup({
        charge: new UntypedFormControl('Other Charge')
      }));

      const modalResponse$ = new Subject<any>();
      spyOn(component, 'displayPendingChargeModal').and.returnValue(modalResponse$.asObservable());
      spyOn(component.rateEngineCall, 'emit');
      component.acceptCharge(component.pendingChargeLineItems.controls[0].value);

      modalResponse$.subscribe(() => {
        expect(component.pendingChargeLineItems.length).toEqual(0);
        expect(component.deniedChargeLineItems.length).toEqual(0);
        expect(component.costBreakdownItems.length).toEqual(2);
        expect(component.rateEngineCall.emit).toHaveBeenCalledTimes(1);
        done();
      });

      modalResponse$.next({comment: ''});
    });

    it('should call denyCharge and add the line item to denied charges', async (done) => {
      component.pendingChargeLineItems.push(new UntypedFormGroup({
        charge: new UntypedFormControl('Pending Charge'),
        requestStatus: new UntypedFormControl('Successful'),
        responseComment: new UntypedFormControl('N/A'),
        closedDate: new UntypedFormControl('N/A'),
        closedBy: new UntypedFormControl('N/A')
      }));
      component.costBreakdownItems.push(new UntypedFormGroup({
        charge: new UntypedFormControl('Other Charge')
      }));

      const modalResponse$ = new Subject<any>();
      spyOn(component, 'displayPendingChargeModal').and.returnValue(modalResponse$.asObservable());
      component.denyCharge(component.pendingChargeLineItems.controls[0].value);

      modalResponse$.subscribe(() => {
        expect(component.pendingChargeLineItems.length).toEqual(0);
        expect(component.deniedChargeLineItems.length).toEqual(1);
        expect(component.costBreakdownItems.length).toEqual(1);
        done();
      });

      modalResponse$.next({comment: 'deny reason'});
    });

    it('should call openCommentModal and return result', async () => {
      spyOn(utilService, 'openCommentModal').and.returnValue(of({comment: ''}));
      component.displayPendingChargeModal(TEST_MODAL_DATA, 'primary');
      expect(utilService.openCommentModal).toHaveBeenCalled();
    });

    describe('when an empty line item is added', () => {
      beforeEach(() => {
        component.addNewEmptyLineItem();
        component.costBreakdownOptions$.value.push({
          label: 'TST - TestChargeCode',
          value: {
            accessorialCode: 'TST',
            name: 'TST - TestChargeCode'
          }
        });
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

    it('should check for payment terms valid', () => {
      component.paymentTermSelected({value: 'ABCD'});
      expect(component.paymentTermValid).toBeTrue();
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

    it('should skip enable/disable if control is missing', () => {
      component._formGroup.removeControl('currency');
      component.enableDisableCurrency(true);
      // if this doesn't throw an error we pass
    });
  });

  describe('select rate charge', () => {
    let lineItem: UntypedFormGroup;
    beforeEach(() => {
      spyOn(component.rateEngineCall, 'emit');
      component.amountOfInvoiceControl.setValue(10);
      component.costBreakdownItems.push(new UntypedFormGroup({
        charge: new UntypedFormControl('Fuel Surcharge - Miles'),
        totalAmount: new UntypedFormControl(10)
      }));
      lineItem = component.createEmptyLineItemGroup();
      component.costBreakdownItems.push(lineItem);
    });

    it('should not call rate engine', () => {
      expect(component.rateEngineCall.emit).not.toHaveBeenCalled();
    });

  });

  describe('resolve dispute', () => {
    beforeEach(() => {
      spyOn(utilService, 'openCommentModal').and.returnValue(of({comment: 'comment'}));
    });

    it('resolve dispute accept action', done => {
      // Setup
      const disputeLineItem = new UntypedFormGroup({})
      const resolveDisputeModal$ = new Subject<CommentModel>();
      asSpy(utilService.openCommentModal).and.returnValue(resolveDisputeModal$.asObservable());
      component.resolveDispute('Accept', disputeLineItem);

      // Assertions
      resolveDisputeModal$.subscribe(() => {
        expect(utilService.openCommentModal).toHaveBeenCalled();
        done();
      });

      // Run Test
      resolveDisputeModal$.next({comment: 'comments'}, );
    });

    it('resolve dispute deny action', done => {
      // Setup
      const disputeLineItem = new UntypedFormGroup({})
      const resolveDisputeModal$ = new Subject<CommentModel>();
      asSpy(utilService.openCommentModal).and.returnValue(resolveDisputeModal$.asObservable());
      component.resolveDispute('Deny', disputeLineItem);

      // Assertions
      resolveDisputeModal$.subscribe(() => {
        expect(utilService.openCommentModal).toHaveBeenCalled();
        done();
      });

      // Run Test
      resolveDisputeModal$.next({comment: ''});
    });
  });

  describe('accessorial details view', () => {
    it('should expand', () => {
      const costLineItem = {
        expanded: false
      };
      component.onExpandCostLineItem(costLineItem);
      expect(costLineItem.expanded).toBeTrue();
    });
  });

  it('should match cost breakdown to calc detail control', () => {
    const control = component.createEmptyLineItemGroup();
    control.get('charge')?.setValue(TEST_CALC_DETAIL);
    const result = component.costBreakdownOptionMatchesControl(TEST_CALC_DETAIL_OPTION, control);
    expect(result).toBeTrue();
  });

  it('should match cost breakdown to label control', () => {
    const control = component.createEmptyLineItemGroup();
    control.get('charge')?.setValue(TEST_CALC_DETAIL_OPTION.label);
    const result = component.costBreakdownOptionMatchesControl(TEST_CALC_DETAIL_OPTION, control);
    expect(result).toBeTrue();
  });

  it('should NOT match cost breakdown to calc detail or label control', () => {
    const control = component.createEmptyLineItemGroup();
    control.get('charge')?.setValue(TEST_CALC_DETAIL);
    const result = component.costBreakdownOptionMatchesControl(OTHER_CALC_DETAIL_OPTION, control);
    expect(result).toBeFalse();
  });

  it('should filter options that are already present in cost breakdown', () => {
    const input: Array<SelectOption<CalcDetail>> = [TEST_CALC_DETAIL_OPTION];
    const control = component.createEmptyLineItemGroup();
    control.get('charge')?.setValue(TEST_CALC_DETAIL);
    component.costBreakdownItems.push(control);
    const output = component.filterCostBreakdownOptions(input);
    expect(output).toEqual([OTHER_CALC_DETAIL_OPTION]);
  });

  it('should NOT filter options that are NOT already present in cost breakdown', () => {
    const input: Array<SelectOption<CalcDetail>> = [TEST_CALC_DETAIL_OPTION];
    const output = component.filterCostBreakdownOptions(input);
    expect(output).toEqual([
      TEST_CALC_DETAIL_OPTION,
      OTHER_CALC_DETAIL_OPTION
    ]);
  });

  it('should filter options that are already present in pending charges and cost breakdown', () => {
    const input: Array<SelectOption<CalcDetail>> = [TEST_CALC_DETAIL_OPTION_TWO];
    const controlOne = component.createEmptyLineItemGroup();
    const controlTwo = component.createEmptyLineItemGroup();
    controlOne.get('charge')?.setValue(TEST_CALC_DETAIL);
    component.costBreakdownItems.push(controlOne);
    controlTwo.get('charge')?.setValue(TEST_CALC_DETAIL_TWO);
    component.pendingChargeLineItems.push(controlTwo);
    const output = component.filterCostBreakdownOptions(input);
    expect(output).toEqual([OTHER_CALC_DETAIL_OPTION]);
  });

  it('should call onAddChargeButtonClick and cancel adding charge', async () => {
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(utilService, 'openNewChargeModal').and.returnValue(of(undefined));
    spyOn(component.rateEngineCall, 'emit').and.stub();
    const originalCostLineItemCount = component.costBreakdownItems.length;
    const promise = component.onAddChargeButtonClick();
    // simulate returning empty accessorial details
    component.costBreakdownOptions$.value = [];
    await promise;
    expect(component.getAccessorialDetails.emit).toHaveBeenCalledTimes(1);
    expect(utilService.openNewChargeModal).toHaveBeenCalledTimes(1);
    expect(component.rateEngineCall.emit).not.toHaveBeenCalled();
    expect(component.costBreakdownItems.length).toEqual(originalCostLineItemCount);
  });

  it('should call onAddChargeButtonClick and select other charge', async () => {
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(utilService, 'openNewChargeModal').and.returnValue(of({
      uid: 'OTHER1',
      selected: OTHER_CALC_DETAIL,
      comment: 'some comment'
    }));
    spyOn(component.fileFormGroup, 'removeControl').and.stub();
    spyOn(component.fileFormGroup, 'addControl').and.stub();
    spyOn(component.rateEngineCall, 'emit').and.stub();
    const originalCostLineItemCount = component.costBreakdownItems.length;
    const promise = component.onAddChargeButtonClick();
    // simulate returning empty accessorial details
    component.costBreakdownOptions$.value = [];
    await promise;
    expect(component.getAccessorialDetails.emit).toHaveBeenCalledTimes(1);
    expect(utilService.openNewChargeModal).toHaveBeenCalledTimes(1);
    expect(component.costBreakdownItems.length).toEqual(originalCostLineItemCount + 1);
    expect(component.fileFormGroup.removeControl).toHaveBeenCalledTimes(1);
    expect(component.fileFormGroup.addControl).toHaveBeenCalledTimes(1);
  });

  it('should call onAddChargeButtonClick and not call getAccessorialDetails if invoice has spot quote.', async () => {
    component.isSpotQuote = true;
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(utilService, 'openNewChargeModal').and.returnValue(of({
      uid: 'OTHER1',
      selected: OTHER_CALC_DETAIL,
      comment: 'some comment'
    }));
    spyOn(component.fileFormGroup, 'removeControl').and.stub();
    spyOn(component.fileFormGroup, 'addControl').and.stub();
    spyOn(component.rateEngineCall, 'emit').and.stub();
    const originalCostLineItemCount = component.costBreakdownItems.length;
    const promise = component.onAddChargeButtonClick();
    // simulate returning empty accessorial details
    component.costBreakdownOptions$.value = [];
    await promise;
    expect(component.getAccessorialDetails.emit).toHaveBeenCalledTimes(0);

  });

  it('should call onAddChargeButtonClick and select accessorial charge', async () => {
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(utilService, 'openNewChargeModal').and.returnValue(of({
      uid: 'TEST',
      selected: TEST_CALC_DETAIL,
      comment: 'some comment'
    }));
    spyOn(component.rateEngineCall, 'emit').and.stub();
    const originalCostLineItemCount = component.costBreakdownItems.length;
    const promise = component.onAddChargeButtonClick();
    // simulate returning empty accessorial details
    component.costBreakdownOptions$.value = [];
    await promise;
    expect(component.getAccessorialDetails.emit).toHaveBeenCalledTimes(1);
    expect(utilService.openNewChargeModal).toHaveBeenCalledTimes(1);
    expect(component.rateEngineCall.emit).toHaveBeenCalledTimes(1);
    expect(component.costBreakdownItems.length).toEqual(originalCostLineItemCount + 1);
    // @ts-ignore
    expect(component.costBreakdownItemsControls[0].get('attachment').value.url).toEqual('no-file');

  });

  it('should call onAddChargeButtonClick and have attachment with pending when file is uploaded', async () => {
    spyOn(utilService, 'openNewChargeModal').and.returnValue(of({
      uid: 'TEST',
      selected: TEST_CALC_DETAIL,
      comment: 'some comment',
      file: new File([], '', undefined)
    }));
    spyOn(component.rateEngineCall, 'emit').and.stub();
    const promise = component.onAddChargeButtonClick();
    // simulate returning empty accessorial details
    component.costBreakdownOptions$.value = [];
    await promise;
    // @ts-ignore
    expect(component.costBreakdownItemsControls[0].get('attachment').value.url).toEqual('pending');
  });

  it('should call onAddChargeButtonClick and have attachment with no-file when NO file is uploaded', async () => {
    spyOn(utilService, 'openNewChargeModal').and.returnValue(of({
      uid: 'TEST',
      selected: TEST_CALC_DETAIL,
      comment: 'some comment'
    }));
    spyOn(component.rateEngineCall, 'emit').and.stub();
    const promise = component.onAddChargeButtonClick();
    // simulate returning empty accessorial details
    component.costBreakdownOptions$.value = [];
    await promise;
    // @ts-ignore
    expect(component.costBreakdownItemsControls[0].get('attachment').value.url).toEqual('no-file');
  });

  it('should download attachment', () => {
    spyOn(component, 'downloadAttachment').and.callThrough();
    component.downloadAttachment('url');
    expect(component.downloadAttachment).toHaveBeenCalled();
  });

  it('should load charge line options', done => {
    const subject = new Subject<RateDetailResponse>();
    component.chargeLineItemOptions$ = subject.asObservable();
    subject.subscribe(() => {
      expect(component.costBreakdownOptions$.value.length).toBe(1);
      done();
    });
    subject.next({
      mode: 'TEST MODE',
      scac: 'TEST SCAC',
      shipDate: '2022-03-03',
      origin: {
        streetAddress: 'address1',
        locCode: 'code1',
        city: 'city1',
        state: 'state1',
        zip: 'zip1',
        country: 'USA',
      },
      destination: {
        streetAddress: 'address2',
        locCode: 'code2',
        city: 'city2',
        state: 'state2',
        zip: 'zip2',
        country: 'USA',
      },
      calcDetails: [{
        name: 'string',
        accessorialCode: 'string'
      }]
    });
  });

  it('should be able to get cost breakdown total while missing invoice amount control', () => {
    component._formGroup.removeControl('amountOfInvoice');
    const result = component.costBreakdownTotal;
    expect(result).toBe(0);
    // no error means we pass
  });

  it('should be able to get cost breakdown total while missing line total', () => {
    component.amountOfInvoiceControl.setValue(123.45);
    component.costBreakdownItems.clear();
    component.costBreakdownItems.push(new UntypedFormGroup({}));
    const result = component.costBreakdownTotal;
    expect(result).toBe(0);
  });

  it('should call onEditCostLineItem and emit to rate engine', async () => {
    component._formGroup = new UntypedFormGroup({
      pendingChargeLineItems: new UntypedFormArray([
        new UntypedFormGroup({
          uid: new UntypedFormControl('OTHER1'),
          charge: new UntypedFormControl('OTHER')
        })
      ])
    });
    const costLineItem = component.pendingChargeLineItemControls[0];
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(component.fileFormGroup, 'removeControl').and.stub();
    spyOn(component.fileFormGroup, 'addControl').and.stub();
    spyOn(utilService, 'openEditChargeModal').and.returnValue(of({
      uid: 'OTHER1',
      charge: 'OTHER',
      variables: [{
        variable: 'test',
        quantity: 1
      }]
    }));
    spyOn(component.rateEngineCall, 'emit').and.stub();
    const promise = component.onEditCostLineItem(costLineItem, component.pendingChargeLineItemControls);
    await promise;
    expect(utilService.openEditChargeModal).toHaveBeenCalledTimes(1);
    expect(component.rateEngineCall.emit).toHaveBeenCalled();
    expect(component.fileFormGroup.removeControl).toHaveBeenCalledTimes(1);
    expect(component.fileFormGroup.addControl).toHaveBeenCalledTimes(1);
  });

  it('should call onEditCostLineItem with file being passed.', async () => {
    component.costBreakdownItems.push(new UntypedFormGroup({
      uid: new UntypedFormControl('OTHER1'),
      charge: new UntypedFormControl('OTHER'),
      attachment: new UntypedFormControl()
    }));
    const costLineItem = component.costBreakdownItemsControls[0];
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(utilService, 'openEditChargeModal').and.returnValue(of({
      uid: 'OTHER1',
      charge: 'OTHER',
      variables: [{
        variable: 'test',
        quantity: 1
      }],
      file: new File([], '', undefined)
    }));
    const promise = component.onEditCostLineItem(costLineItem, component.costBreakdownItemsControls);
    await promise;
    expect(component.costBreakdownItemsControls[0].get('attachment')?.value.url).toEqual('pending');
  });

  it('should call onEditCostLineItem for Spot Quote.', async () => {
    component.costBreakdownItems.push(new UntypedFormGroup({
      uid: new UntypedFormControl('SPOTQUOTE1'),
      charge: new UntypedFormControl('Spot Quote'),
    }));
    const costLineItem = component.costBreakdownItemsControls[0];
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(utilService, 'openEditChargeModal').and.returnValue(of({
      uid: 'SPOTQUOTE1',
      charge: 'Spot Quote',
      variables: [{
        variable: 'test',
        quantity: 1
      }],
    }));
    const promise = component.onEditCostLineItem(costLineItem, component.costBreakdownItemsControls);
    await promise;
    expect(utilService.openEditChargeModal).toHaveBeenCalledTimes(1);
  });

  it('should call onEditCostLineItem with NO new file being passed and no existing file', async () => {
    component.costBreakdownItems.push(  new UntypedFormGroup({
      uid: new UntypedFormControl('OTHER1'),
      charge: new UntypedFormControl('OTHER'),
      attachment: new UntypedFormControl()
    }));

    const costLineItem = component.costBreakdownItemsControls[0];
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(utilService, 'openEditChargeModal').and.returnValue(of({
      uid: 'OTHER1',
      charge: 'OTHER',
      variables: [{
        variable: 'test',
        quantity: 1
      }]
    }));
    const promise = component.onEditCostLineItem(costLineItem, component.costBreakdownItemsControls);
    await promise;
    expect(component.costBreakdownItemsControls[0].get('attachment')?.value.url).toEqual('no-file');
  });

  it('should call onEditCostLineItem with NO new file being passed and an existing file.', async () => {
    component.costBreakdownItems.push(  new UntypedFormGroup({
      charge: new UntypedFormControl('OTHER'),
      attachment: new UntypedFormControl()
    }));
    const attachment = {fileName: 'test'};
    component.costBreakdownItemsControls[0].get('attachment')?.setValue(attachment);

    const costLineItem = component.costBreakdownItemsControls[0];
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(utilService, 'openEditChargeModal').and.returnValue(of({
      uid: 'OTHER1',
      charge: 'OTHER',
      variables: [{
        variable: 'test',
        quantity: 1
      }]
    }));
    const promise = component.onEditCostLineItem(costLineItem, component.costBreakdownItemsControls);
    await promise;
    expect(component.costBreakdownItemsControls[0].get('attachment')?.value.url).toBeUndefined();
  });

  describe('should remove line item', () => {
    beforeEach(() => {
      spyOn(component.getAccessorialDetails, 'emit').and.stub();
      spyOn(utilService, 'openCommentModal').and.returnValue(of({
        comment: ''
      }));
      spyOn(component.rateEngineCall, 'emit').and.stub();
    });

    it('should call onDeleteCostLineItem and remove the line item', async () => {
      component.costBreakdownItems.push(new UntypedFormGroup({
        accessorialCode: new UntypedFormControl('TST'),
        persisted: new UntypedFormControl(true),
      }));
      const costLineItem = component.costBreakdownItemsControls[0];
      await component.onDeleteCostLineItem(costLineItem, 0);
      expect(utilService.openCommentModal).toHaveBeenCalledTimes(1);
      expect(component.rateEngineCall.emit).toHaveBeenCalled();
    });

    it('should call onDeleteCostLineItem and remove the OTHER line item', async () => {
      component.costBreakdownItems.push(new UntypedFormGroup({
        accessorialCode: new UntypedFormControl(''),
        charge: new UntypedFormControl('OTHER'),
        persisted: new UntypedFormControl(true),
      }));
      const costLineItem = component.costBreakdownItemsControls[0];
      await component.onDeleteCostLineItem(costLineItem, 0);
      expect(utilService.openCommentModal).toHaveBeenCalledTimes(1);
      expect(component.rateEngineCall.emit).toHaveBeenCalled();
    });

    it('should call onDeleteCostLineItem and remove the OTHER line item', async () => {
      component.costBreakdownItems.push(new UntypedFormGroup({
        uid: new UntypedFormControl('OTHER1'),
        accessorialCode: new UntypedFormControl(''),
        charge: new UntypedFormControl('OTHER'),
        persisted: new UntypedFormControl(true),
      }));
      component.costBreakdownItems.push(new UntypedFormGroup({
        uid: new UntypedFormControl('OTHER2'),
        accessorialCode: new UntypedFormControl(''),
        charge: new UntypedFormControl('OTHER'),
        persisted: new UntypedFormControl(true),
      }));
      const costLineItem = component.costBreakdownItemsControls[0];
      await component.onDeleteCostLineItem(costLineItem, 0);
      expect(utilService.openCommentModal).toHaveBeenCalledTimes(1);
      expect(component.costBreakdownItemsControls.length).toEqual(1);

      expect(component.costBreakdownItemsControls[0].get('uid')?.value).toEqual('OTHER1');
      expect(component.rateEngineCall.emit).toHaveBeenCalled();
    });

    it('should call onDeleteCostLineItem and remove the line item without modal', async () => {
      component.costBreakdownItems.push(new UntypedFormGroup({
        accessorialCode: new UntypedFormControl('TST'),
        persisted: new UntypedFormControl(false),
        entrySource: new UntypedFormControl('FAL')
      }));
      const costLineItem = component.costBreakdownItemsControls[0];
      await component.onDeleteCostLineItem(costLineItem, 0);
      expect(utilService.openCommentModal).toHaveBeenCalledTimes(0);
      expect(component.rateEngineCall.emit).toHaveBeenCalled();
    });
  });
});
