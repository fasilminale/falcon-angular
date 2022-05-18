import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {Observable, of, Subject} from 'rxjs';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {CostLineItem} from 'src/app/models/line-item/line-item-model';
import {FalconTestingModule} from 'src/app/testing/falcon-testing.module';
import {InvoiceOverviewDetail} from 'src/app/models/invoice/invoice-overview-detail.model';
import {InvoiceAmountComponent} from './invoice-amount.component';
import {CalcDetail, CostBreakDownUtils, RateDetailResponse, RatesResponse} from '../../../models/rate-engine/rate-engine-request';
import {SelectOption} from '../../../models/select-option-model/select-option-model';
import {CommentModalData, CommentModel, UtilService} from '../../../services/util-service';
import {NewChargeModalInput, NewChargeModalOutput} from '../../../components/fal-new-charge-modal/fal-new-charge-modal.component';
import {asSpy} from '../../../testing/test-utils.spec';
import {InvoiceDataModel} from '../../../models/invoice/invoice-model';
import {ConfirmationModalData} from '@elm/elm-styleguide-ui';
import {FalCommentModalComponent} from '../../../components/fal-comment-modal/fal-comment-modal.component';
import {mergeMap} from 'rxjs/operators';

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
    confirmButtonStyle: 'primary',
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
          openNewChargeModal: (data: NewChargeModalInput): Observable<NewChargeModalOutput> => {
            throw new Error('Spy On this function instead!');
          },
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
    component.formGroup = new FormGroup({});
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
        component.costBreakdownItems.push(new FormGroup({
          totalAmount: new FormControl(10),
          rateSource: new FormControl('Contract')
        }));
        component.costBreakdownItems.push(new FormGroup({
          totalAmount: new FormControl(20),
          rateSource: new FormControl('Manual')
        }));
        component.costBreakdownItems.push(new FormGroup({
          totalAmount: new FormControl(),
          rateSource: new FormControl('Manual')
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
    let rateEngineCallResult$: Subject<RatesResponse>;
    beforeEach(() => {
      loadInvoiceAmountDetail$ = new Subject();
      component.formGroup = new FormGroup({});
      component.loadInvoiceAmountDetail$ = loadInvoiceAmountDetail$.asObservable();
    });
    beforeEach(() => {
      loadInvoiceOverviewDetail$ = new Subject();
      component.loadInvoiceOverviewDetail$ = loadInvoiceOverviewDetail$.asObservable();
    });
    beforeEach(() => {
      rateEngineCallResult$ = new Subject();
      component.rateEngineCallResult$ = rateEngineCallResult$.asObservable();
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
            planned: false,
            fuel: false,
            message: '',
            manual: false,
            expanded: false
          }
        ],
        pendingChargeLineItems: [{
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
          planned: false,
          fuel: false,
          message: '',
          manual: false,
          expanded: false
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
      component._formGroup = new FormGroup(
        {
          costBreakdownItems: new FormArray([]),
          pendingChargeLineItems: new FormArray([]),
          deniedChargeLineItems: new FormArray([]),
          disputeLineItems: new FormArray([])
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
            planned: false,
            fuel: false,
            message: '',
            manual: false,
            expanded: false
          }
        ],
        pendingChargeLineItems: [],
        deniedChargeLineItems: [],
        disputeLineItems: [],
        standardPaymentTermsOverride: 'TestTerms',
        mileage: '100'
      });
      expect(component.overridePaymentTermsFormGroup.controls.paymentTerms.value).toEqual('TestTerms');
      component.isPaymentOverrideSelected.at(0).setValue(null);
      expect(component.overridePaymentTermsFormGroup.controls.paymentTerms.value).toBeNull();
      done();
    });

    it('should call acceptCharge and add the line item to cost breakdown charges', async (done) => {
      component.pendingChargeLineItems.push(new FormGroup({
        charge: new FormControl('Charge')
      }));
      component.costBreakdownItems.push(new FormGroup({
        charge: new FormControl('Other Charge')
      }));

      const modalResponse$ = new Subject<any>();
      spyOn(component, 'displayPendingChargeModal').and.returnValue(modalResponse$.asObservable());
      component.acceptCharge(component.pendingChargeLineItems.controls[0].value);

      modalResponse$.subscribe(() => {
        expect(component.pendingChargeLineItems.length).toEqual(0);
        expect(component.deniedChargeLineItems.length).toEqual(0);
        expect(component.costBreakdownItems.length).toEqual(2);
        done();
      });

      modalResponse$.next({comment: ''});
    });

    it('should call denyCharge and add the line item to denied charges', async (done) => {
      component.pendingChargeLineItems.push(new FormGroup({
        charge: new FormControl('Pending Charge')
      }));
      component.costBreakdownItems.push(new FormGroup({
        charge: new FormControl('Other Charge')
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
      component.displayPendingChargeModal(TEST_MODAL_DATA);
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

      // FIXME in FAL-547 - this feature is temporarily unsupported
      xit('should populate cost breakdown line item', done => {
        const control = component.costBreakdownItems.controls[0];
        control.patchValue({charge: component.costBreakdownOptions$.value[0].value});
        component.pendingAccessorialCode = 'TST';
        rateEngineCallResult$.next({
          mode: 'LTL',
          carrierRateSummaries: [{
            totalCost: '0',
            scac: 'ODFL',
            legs: [
              {
                carrierRate: {
                  accessorialList: [],
                  lineItems: [
                    {
                      description: 'TST - TestChargeCode',
                      rate: '100',
                      rateType: 'FLAT',
                      lineItemTotal: '100',
                      lineItemType: 'ACCESSORIAL',
                      runningTotal: '100',
                      step: '1',
                      costName: 'TestCostName',
                      quantity: 0,
                      message: '',
                      accessorial: true
                    }
                  ]
                }
              }
            ]
          }]
        });
        expect(component.filteredCostBreakdownOptions.length).toEqual(1);
        done();
      });


      // FIXME in FAL-547 - this feature is temporarily unsupported
      xit('should populate cost breakdown line item', done => {
        component.pendingAccessorialCode = 'OTH';
        rateEngineCallResult$.next({
          mode: 'LTL',
          carrierRateSummaries: [{
            totalCost: '0',
            scac: 'ODFL',
            legs: [
              {
                carrierRate: {
                  accessorialList: [],
                  lineItems: [
                    {
                      description: 'OTH - OtherChargeCode',
                      rate: '100',
                      rateType: 'FLAT',
                      lineItemTotal: '100',
                      lineItemType: 'ACCESSORIAL',
                      runningTotal: '100',
                      step: '1',
                      costName: 'TestCostName',
                      quantity: 0,
                      message: '',
                      accessorial: true
                    }
                  ]
                }
              }
            ]
          }]
        });
        expect(component.filteredCostBreakdownOptions.length).toEqual(2);
        done();
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

  describe('select rate charge', () => {
    let lineItem: FormGroup;
    beforeEach(() => {
      spyOn(component.rateEngineCall, 'emit');
      component.amountOfInvoiceControl.setValue(10);
      component.costBreakdownItems.push(new FormGroup({
        charge: new FormControl('Fuel Surcharge - Miles'),
        totalAmount: new FormControl(10)
      }));
      lineItem = component.createEmptyLineItemGroup();
      component.costBreakdownItems.push(lineItem);
    });

    it('should call rate engine', () => {
      const selectedCharge = {accessorialCode: 'TST', name: 'TestChargeCode'};
      component.onSelectRate(selectedCharge, lineItem);
      expect(component.rateEngineCall.emit).toHaveBeenCalledWith(selectedCharge.accessorialCode);
    });

    it('should not call rate engine', () => {
      component.onSelectRate(OTHER_CALC_DETAIL, lineItem);
      expect(component.rateEngineCall.emit).not.toHaveBeenCalled();
    });

    it('should recalculate total cost', done => {
      const totalCost = component.amountOfInvoiceControl.value;
      component.onSelectRate(OTHER_CALC_DETAIL, lineItem);
      const lineItemTotalAmountControl = lineItem.get('totalAmount');
      expect(lineItemTotalAmountControl).not.toBeFalsy();
      lineItem.valueChanges.subscribe(() => {
        expect(component.amountOfInvoiceControl.value).toEqual(totalCost + 40);
        done();
      });
      lineItemTotalAmountControl?.setValue(40.00);
    });

  });

  describe('resolve dispute', () => {
    it('should emit call to resolve dispute', () => {
      const resolveDisputeEmitter = spyOn(component.resolveDisputeCall, 'emit');
      const action = 'Accept';
      component.resolveDispute(action);
      expect(resolveDisputeEmitter).toHaveBeenCalledWith(action);
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
      selected: OTHER_CALC_DETAIL,
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
    expect(component.rateEngineCall.emit).not.toHaveBeenCalled();
    expect(component.costBreakdownItems.length).toEqual(originalCostLineItemCount + 1);
  });

  it('should call onAddChargeButtonClick and select accessorial charge', async () => {
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(utilService, 'openNewChargeModal').and.returnValue(of({
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
  });

  it('should download attachment', () => {
    spyOn(component, 'downloadAttachment').and.callThrough();
    component.downloadAttachment('url');
    expect(component.downloadAttachment).toHaveBeenCalled();
  });
});
