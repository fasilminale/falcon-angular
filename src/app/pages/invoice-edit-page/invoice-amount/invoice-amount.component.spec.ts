import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {Observable, of, Subject} from 'rxjs';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {CostLineItem, DisputeLineItem} from 'src/app/models/line-item/line-item-model';
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
import {NewChargeModalInput, NewChargeModalOutput} from '../../../components/fal-new-charge-modal/fal-new-charge-modal.component';
import {ConfirmationModalData} from '@elm/elm-styleguide-ui';
import {FalEditChargeModalComponent} from '../../../components/fal-edit-charge-modal/fal-edit-charge-modal.component';

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
          expanded: false,
          variables: []
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
        deletedChargeLineItems: [],
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
        charge: new FormControl('Charge'),
        requestStatus: new FormControl('Successful'),
        responseComment: new FormControl('N/A'),
        closedDate: new FormControl('N/A'),
        closedBy: new FormControl('N/A')
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
        charge: new FormControl('Pending Charge'),
        requestStatus: new FormControl('Successful'),
        responseComment: new FormControl('N/A'),
        closedDate: new FormControl('N/A'),
        closedBy: new FormControl('N/A')
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

    it('should skip enable/disable if control is missing', () => {
      component._formGroup.removeControl('currency');
      component.enableDisableCurrency(true);
      // if this doesn't throw an error we pass
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

    it('should not call rate engine', () => {
      expect(component.rateEngineCall.emit).not.toHaveBeenCalled();
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
    component.costBreakdownItems.push(new FormGroup({}));
    const result = component.costBreakdownTotal;
    expect(result).toBe(0);
  });


  it('should call onEditCostLineItem and emit to rate engine', async () => {
    component._formGroup = new FormGroup({
      pendingChargeLineItems: new FormArray([
        new FormGroup({
          charge: new FormControl('test')
        })
      ])
    });
    const costLineItem = component.pendingChargeLineItemControls[0];
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(utilService, 'openEditChargeModal').and.returnValue(of({
      charge: 'test',
      variables: []
    }));
    spyOn(component.rateEngineCall, 'emit').and.stub();
    const promise = component.onEditCostLineItem(costLineItem, component.pendingChargeLineItemControls);
    await promise;
    expect(utilService.openEditChargeModal).toHaveBeenCalledTimes(1);
    expect(component.rateEngineCall.emit).toHaveBeenCalled();
  });

  it('should call onDeleteCostLineItem and remove the line item', async () => {
    component.costBreakdownItems.push(new FormGroup({
      accessorialCode: new FormControl('TST')
    }));

    const costLineItem = component.costBreakdownItemsControls[0];
    spyOn(component.getAccessorialDetails, 'emit').and.stub();
    spyOn(utilService, 'openCommentModal').and.returnValue(of({
      comment: ''
    }));
    spyOn(component.rateEngineCall, 'emit').and.stub();
    await component.onDeleteCostLineItem(costLineItem);
    expect(utilService.openCommentModal).toHaveBeenCalledTimes(1);
    expect(component.rateEngineCall.emit).toHaveBeenCalled();
  });
});
