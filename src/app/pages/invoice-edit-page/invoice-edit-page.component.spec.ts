import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';

import {InvoiceEditPageComponent} from './invoice-edit-page.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {of, Subject, throwError} from 'rxjs';
import {InvoiceService} from '../../services/invoice-service';
import {MockParamMap} from '../../testing/test-utils';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {ToastService, UserInfo} from '@elm/elm-styleguide-ui';
import {UserService} from '../../services/user-service';
import {asSpy} from '../../testing/test-utils.spec';
import {CommentModel, UtilService} from '../../services/util-service';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {RateService} from '../../services/rate-service';
import {TripInformationComponent} from './trip-information/trip-information.component';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {BillToLocationUtils, Location, LocationUtils} from '../../models/location/location-model';

describe('InvoiceEditPageComponent', () => {

  const TEST_MODE = {
    mode: 'TEST',
    reportKeyMode: 'TST',
    reportModeDescription: 'Test'
  };
  const TEST_CARRIER = {
    name: 'TEST',
    scac: 'TST'
  };
  const TEST_DATE = '2022-05-12T15:35:32Z';
  const TEST_LOCATION: Location = {
    address: '123 Fake Street',
    address2: undefined,
    city: 'test',
    country: 'USA',
    name: 'test',
    state: 'TS',
    zipCode: '12345',
    code: undefined
  };

  const glLineItemFormArray = new FormArray([]);
  glLineItemFormArray.push(new FormGroup({
    allocationPercent: new FormControl(100),
    customerCategory: new FormControl('CAH'),
    glProfitCenter: new FormControl('2586931'),
    glCostCenter: new FormControl('2586931'),
    glAccount: new FormControl('7153200'),
    glCompanyCode: new FormControl('2140'),
    allocationAmount: new FormControl(183.58)
  }));
  const invalidGlLineItemFormArray = new FormArray([]);
  invalidGlLineItemFormArray.push(new FormGroup({
    allocationPercent: new FormControl(100),
    customerCategory: new FormControl('CAH'),
    glProfitCenter: new FormControl('2586931'),
    glCostCenter: new FormControl('2586931'),
    glAccount: new FormControl('7153200'),
    glCompanyCode: new FormControl('2140'),
    allocationAmount: new FormControl(183.58),
    errorText: new FormControl('Values do not match with master data')
  }));

  const MOCK_LOCATION: Location = {
    name: 'test',
    address: '123 Fake Street',
    address2: 'address2',
    city: 'test',
    country: 'USA',
    state: 'TS',
    zipCode: '12345',
    code: 'TXH',
  };
  const originAddressFormGroup = new FormGroup({
    streetAddress: new FormControl(MOCK_LOCATION.address),
    streetAddress2: new FormControl(MOCK_LOCATION.address2),
    city: new FormControl(MOCK_LOCATION.city),
    country: new FormControl(MOCK_LOCATION.country),
    name: new FormControl(MOCK_LOCATION.name),
    state: new FormControl(MOCK_LOCATION.state),
    zipCode: new FormControl(MOCK_LOCATION.zipCode),
    shippingPoint: new FormControl(MOCK_LOCATION.code)
  });
  const destinationAddressFormGroup = new FormGroup({
    streetAddress: new FormControl(MOCK_LOCATION.address),
    streetAddress2: new FormControl(MOCK_LOCATION.address2),
    city: new FormControl(MOCK_LOCATION.city),
    country: new FormControl(MOCK_LOCATION.country),
    name: new FormControl(MOCK_LOCATION.name),
    state: new FormControl(MOCK_LOCATION.state),
    zipCode: new FormControl(MOCK_LOCATION.zipCode),
    shippingPoint: new FormControl(MOCK_LOCATION.code)
  });
  const billToAddressFormGroup = new FormGroup({
    streetAddress: new FormControl('123 Fake Street'),
    streetAddress2: new FormControl('N/A'),
    city: new FormControl('test'),
    country: new FormControl('USA'),
    name: new FormControl('test'),
    state: new FormControl('TS'),
    zipCode: new FormControl('12345'),
    idCode: new FormControl('idCode'),
    name2: new FormControl('name2'),
  });

  let component: InvoiceEditPageComponent;
  let fixture: ComponentFixture<InvoiceEditPageComponent>;

  let router: Router;
  let route: ActivatedRoute;
  let routeParamMap$: Subject<ParamMap>;
  let invoiceService: InvoiceService;
  let userService: UserService;
  let utilService: UtilService;
  let toastService: ToastService;
  let rateService: RateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [InvoiceEditPageComponent, TripInformationComponent]
    }).compileComponents();
    // Mock Router
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(of(true).toPromise());

    // Mock ActivatedRoute
    route = TestBed.inject(ActivatedRoute);
    routeParamMap$ = new Subject<ParamMap>();
    spyOnProperty(route, 'paramMap', 'get')
      .and.returnValue(routeParamMap$.asObservable());

    // Mock Invoice Service
    invoiceService = TestBed.inject(InvoiceService);
    spyOn(invoiceService, 'getInvoice').and.returnValue(of());
    spyOn(invoiceService, 'deleteInvoice').and.returnValue(of());
    spyOn(invoiceService, 'deleteInvoiceWithReason').and.returnValue(of());
    spyOn(invoiceService, 'resolveDispute').and.returnValue(of());

    // Mock User Service
    userService = TestBed.inject(UserService);
    spyOn(userService, 'getUserInfo').and.returnValue(of());

    // Mock Util Service
    utilService = TestBed.inject(UtilService);
    spyOn(utilService, 'openErrorModal').and.returnValue(of());
    spyOn(utilService, 'openConfirmationModal').and.returnValue(of(true));
    spyOn(utilService, 'openCommentModal').and.returnValue(of({comment: 'deleteReason'}));
    spyOn(utilService, 'openWeightAdjustmentModal').and.returnValue(of({adjustedWeight: 1.0}));

    // Mock Toast Service
    toastService = TestBed.inject(ToastService);
    spyOn(toastService, 'openErrorToast').and.stub();
    spyOn(toastService, 'openSuccessToast').and.stub();

    // Mock Web Service
    rateService = TestBed.inject(RateService);
    spyOn(rateService, 'getAccessorialDetails').and.returnValue(of());
    spyOn(rateService, 'getRates').and.returnValue(of());
    spyOn(rateService, 'glAllocateInvoice').and.returnValue(of());
    spyOn(rateService, 'updateInvoice').and.returnValue(of());

    // Create Component
    fixture = TestBed.createComponent(InvoiceEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('given falcon invoice number in route params', () => {
    let mockParams: MockParamMap;
    beforeEach(() => {
      mockParams = new MockParamMap();
      mockParams.map.set('falconInvoiceNumber', ['TestFalconInvoiceNumber']);
      component.ngOnInit();
    });

    it('should set falcon invoice number', done => {
      // Assertions
      routeParamMap$.subscribe(() => {
        expect(component.falconInvoiceNumber).toBe('TestFalconInvoiceNumber');
        done();
      });
      // Run Test
      routeParamMap$.next(mockParams);
    });
    describe('and the invoice is found in the database', () => {
      let testInvoice: any;
      beforeEach(() => {
        testInvoice = {
          amountOfInvoice: 1234.56,
          attachments: [],
          carrier: {
            scac: 'testScac'
          },
          comments: 'Test Comment',
          companyCode: 'TestCompanyCode',
          createdBy: 'Test User',
          createdDate: new Date().toISOString(),
          currency: 'USD',
          destination: {
            address: 'testAddress',
            locCode: '',
            city: 'city',
            state: 'state',
            zipCode: '55555',
            country: 'country'
          },
          erpType: 'TPM',
          externalInvoiceNumber: 'EXT1',
          failedToCreate: false,
          falconInvoiceNumber: 'TestFalconInvoiceNumber',
          invoiceDate: new Date().toISOString(),
          lineItems: [],
          mode: {
            mode: 'testMode',
            reportKeyMode: 'testReportKeyMode',
            reportKeyDescription: 'testReportKeyDescription'
          },
          origin: {
            address: 'testAddress',
            locCode: '',
            city: 'city',
            state: 'state',
            zipCode: '55555',
            country: 'country'
          },
          remitHistory: {
            erpInvoiceNumber: '1234',
            erpRemittanceNumber: '5678',
            remitVendorId: 'ZXCV',
            amountOfPayment: 873.83,
            dateOfPayment: '2022-03-09T15:31:30.986Z'
          },
          serviceCode: 'GROUND',
          standardPaymentTermsOverride: '',
          status: {key: 'FAKE', label: 'Fake Status'},
          vendorNumber: '123',
          workType: 'TestWorkType',
          milestones: [{
            type: {key: 'TEST', label: 'Test Milestone'},
            timestamp: new Date().toISOString(),
            user: 'Test User'
          }],
          overriddenDeliveryDateTime: new Date().toISOString(),
          assumedDeliveryDateTime: new Date().toISOString(),
          tripTenderTime: new Date().toISOString(),
          totalGrossWeight: 0
        };
        spyOn(component, 'updateInvoiceFromForms').and.stub();
        spyOn(rateService, 'rateInvoice').and.returnValue(of(testInvoice));
        asSpy(invoiceService.getInvoice).and.returnValue(of(testInvoice));
      });
      it('getAccessorialList should call rate engine', () => {
        component.invoice = new InvoiceDataModel();
        component.getAccessorialList();
        expect(rateService.getAccessorialDetails).toHaveBeenCalled();
      });
      it('getAccessorialList should not call rate engine', () => {
        component.invoice = testInvoice;
        component.getAccessorialList();
        expect(rateService.getAccessorialDetails).not.toHaveBeenCalled();
      });
      it('getRates should call rate engine', () => {
        component.invoice = new InvoiceDataModel();
        component.invoice.mode = {mode: 'TEST', reportKeyMode: 'TST', reportModeDescription: 'Test'};
        component.invoice.carrier = {name: 'TEST', scac: 'TST'};
        component.invoice.pickupDateTime = '2022-05-12T15:35:32Z';
        component.invoice.origin = {address: '123 Fake Street', city: 'test', country: 'USA', name: 'test', state: 'TS', zipCode: '12345'};
        component.invoice.destination = {
          address: '123 Fake Street',
          city: 'test',
          country: 'USA',
          name: 'test',
          state: 'TS',
          zipCode: '12345'
        };
        component.getRates('testAccessorialCode');
        expect(rateService.rateInvoice).toHaveBeenCalled();
      });
      it('getRates should not call rate engine', () => {
        testInvoice.carrier = null;
        component.invoice = testInvoice;
        component.getRates('testAccessorialCode');
        expect(rateService.rateInvoice).not.toHaveBeenCalled();
      });

      it('handleTripEditModeEvent should call getRates', fakeAsync(() => {
        component.handleTripEditModeEvent({event: 'update', value: true});
        tick();
        expect(rateService.updateInvoice).toHaveBeenCalled();
        expect(component.otherSectionEditMode$.value).toEqual(true);
        flush();
      }));

      it('handleTripEditModeEvent should not call getRates', fakeAsync(() => {
        component.handleTripEditModeEvent({event: 'cancel', value: false});
        tick();
        expect(rateService.rateInvoice).not.toHaveBeenCalled();
        expect(component.otherSectionEditMode$.value).toEqual(true);
        flush();
      }));

      it('handleTripEditModeEvent should disable otherSection form controls', fakeAsync(() => {
        component.handleTripEditModeEvent({event: 'edit', value: false});
        tick();
        expect(component.otherSectionEditMode$.value).toEqual(false);
        flush();
      }));

      it('handle getAccessorialDetails response', done => {
        // Setup
        const getAccessorialDetails$ = new Subject<any>();
        asSpy(rateService.getAccessorialDetails).and.returnValue(getAccessorialDetails$.asObservable());
        component.invoice = new InvoiceDataModel();
        component.getAccessorialList();

        // Assertions
        getAccessorialDetails$.subscribe(() => {
          expect(rateService.getAccessorialDetails).toHaveBeenCalled();
          done();
        });

        // Run Test
        getAccessorialDetails$.next(true);
      });

      it('handle getRates response', done => {
        // Setup
        const ratesResponse$ = new Subject<any>();
        asSpy(rateService.getRates).and.returnValue(ratesResponse$.asObservable());
        component.invoice = new InvoiceDataModel();
        component.getRates('testAccessorialCode');

        // Assertions
        ratesResponse$.subscribe(() => {
          expect(rateService.rateInvoice).toHaveBeenCalled();
          done();
        });

        // Run Test
        ratesResponse$.next(true);
      });

      it('handle getRates response with rate engine error', done => {
        // Setup
        const ratesResponse$ = new Subject<any>();
        asSpy(rateService.getRates).and.returnValue(ratesResponse$.asObservable());
        component.invoice = new InvoiceDataModel();
        component.invoice.hasRateEngineError = true;
        component.getRates('testAccessorialCode');

        // Assertions
        ratesResponse$.subscribe(() => {
          expect(rateService.rateInvoice).toHaveBeenCalled();
          done();
        });

        // Run Test
        ratesResponse$.next(true);
      });

      it('should load milestones', done => {
        // Assertions
        routeParamMap$.subscribe(() => {
          expect(component.milestones).toEqual(testInvoice.milestones);
          done();
        });
        // Run Test
        routeParamMap$.next(mockParams);
      });
      it('should not be deleted invoice', done => {
        // Assertions
        routeParamMap$.subscribe(() => {
          expect(component.isDeletedInvoice).toBeFalse();
          done();
        });
        // Run Test
        routeParamMap$.next(mockParams);
      });
      it('should not be editable invoice', done => {
        // Assertions
        routeParamMap$.subscribe(() => {
          expect(component.isEditableInvoice).toBeFalse();
          done();
        });
        // Run Test
        routeParamMap$.next(mockParams);
      });
      it('should not be auto invoice', done => {
        // Assertions
        routeParamMap$.subscribe(() => {
          expect(component.isAutoInvoice).toBeFalse();
          done();
        });
        // Run Test
        routeParamMap$.next(mockParams);
      });
      it('should load status', done => {
        // Assertions
        routeParamMap$.subscribe(() => {
          expect(component.invoiceStatus).toEqual(testInvoice.status.label);
          done();
        });
        // Run Test
        routeParamMap$.next(mockParams);
      });
    });
  });

  it('should default falcon invoice number to empty when missing', done => {
    // Setup
    const mockParams = new MockParamMap();
    component.ngOnInit();
    // Assertions
    routeParamMap$.subscribe(() => {
      expect(component.falconInvoiceNumber).toBe('');
      done();
    });
    // Run Test
    routeParamMap$.next(mockParams);
  });

  it('should load user info', done => {
    // Setup
    const getUserInfo$ = new Subject<UserInfo>();
    asSpy(userService.getUserInfo).and.returnValue(getUserInfo$.asObservable());
    const testUser = new UserInfoModel({
      firstName: 'Test',
      lastName: 'User',
      role: 'TEST_ROLE',
      permissions: []
    });
    component.ngOnInit();
    // Assertions
    getUserInfo$.subscribe(() => {
      expect(component.userInfo).toEqual(testUser);
      done();
    });
    // Run Test
    getUserInfo$.next(testUser);
  });

  it('#clickCloseBanner should close banner', () => {
    const initialValue = component.showEditInfoBanner;
    component.clickCloseBanner();
    expect(component.showEditInfoBanner).toEqual(false);
  });

  it('#clickToggleEditMode should toggle isGlobalEditMode$', () => {
    const initialValue = component.isGlobalEditMode$.value;
    component.clickToggleEditMode();
    expect(component.isGlobalEditMode$.value).toEqual(!initialValue);
  });

  it('#clickToggleMilestoneTab should toggle isMilestoneTabOpen', () => {
    const initialValue = component.isMilestoneTabOpen;
    component.clickToggleMilestoneTab();
    expect(component.isMilestoneTabOpen).toEqual(!initialValue);
  });

  it('#clickCancelButton should call router to navigate to invoice list', () => {
    component.clickCancelButton();
    expect(component.isGlobalEditMode$.value).toEqual(false);
    expect(component.otherSectionEditMode$.value).toEqual(false);
    expect(component.isTripEditMode$.value).toEqual(false);
  });

  it('#clickCancelButton should ask the user to confirm canceling changes', async (done) => {
    component.isGlobalEditMode$.value = true;
    component.invoiceFormGroup.markAsDirty();
    spyOn(component, 'askForCancelConfirmation').and.callThrough();
    component.clickCancelButton();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.askForCancelConfirmation).toHaveBeenCalled();
    expect(component.isGlobalEditMode$.value).toEqual(false);
    expect(component.otherSectionEditMode$.value).toEqual(false);
    expect(component.isTripEditMode$.value).toEqual(false);
    done();
  });

  it('#clickDeleteButton with deleted reason', done => {
    // Setup
    component.isAutoInvoice = true;
    component.isApprovedInvoice = true;
    const deleteInvoiceWithReason$ = new Subject<any>();
    asSpy(invoiceService.deleteInvoiceWithReason).and.returnValue(deleteInvoiceWithReason$.asObservable());
    const deleteModal$ = new Subject<string>();
    asSpy(utilService.openCommentModal).and.returnValue(deleteModal$.asObservable());
    component.clickDeleteButton();

    // Assertions
    deleteModal$.subscribe(() => {
      expect(utilService.openCommentModal).toHaveBeenCalled();
      deleteInvoiceWithReason$.next();
    });
    deleteInvoiceWithReason$.subscribe(() => {
      expect(invoiceService.deleteInvoiceWithReason).toHaveBeenCalled();
      done();
    });

    // Run Test
    deleteModal$.next('deleteReason');
  });

  it('resolve dispute accept action', done => {
    // Setup
    const invoice = new InvoiceDataModel();
    const resolveDisputeResult$ = new Subject<any>();
    asSpy(invoiceService.resolveDispute).and.returnValue(resolveDisputeResult$.asObservable());
    const resolveDisputeModal$ = new Subject<CommentModel>();
    asSpy(utilService.openCommentModal).and.returnValue(resolveDisputeModal$.asObservable());
    component.disputeAction('Accept');

    // Assertions
    resolveDisputeModal$.subscribe(() => {
      expect(utilService.openCommentModal).toHaveBeenCalled();
      resolveDisputeResult$.next(invoice);
    });
    resolveDisputeResult$.subscribe(() => {
      expect(invoiceService.resolveDispute).toHaveBeenCalled();
      done();
    });

    // Run Test
    resolveDisputeModal$.next({comment: 'comments'});
  });

  it('resolve dispute accept with no comments', done => {
    // Setup
    const invoice = new InvoiceDataModel();
    const resolveDisputeResult$ = new Subject<any>();
    asSpy(invoiceService.resolveDispute).and.returnValue(resolveDisputeResult$.asObservable());
    const resolveDisputeModal$ = new Subject<CommentModel>();
    asSpy(utilService.openCommentModal).and.returnValue(resolveDisputeModal$.asObservable());
    component.disputeAction('Accept');

    // Assertions
    resolveDisputeModal$.subscribe(() => {
      expect(utilService.openCommentModal).toHaveBeenCalled();
      resolveDisputeResult$.next(invoice);
    });
    resolveDisputeResult$.subscribe(() => {
      expect(invoiceService.resolveDispute).toHaveBeenCalled();
      done();
    });

    // Run Test
    resolveDisputeModal$.next({comment: ''});
  });

  it('resolve dispute deny action', done => {
    // Setup
    const invoice = new InvoiceDataModel();
    const resolveDisputeResult$ = new Subject<any>();
    asSpy(invoiceService.resolveDispute).and.returnValue(resolveDisputeResult$.asObservable());
    const resolveDisputeModal$ = new Subject<CommentModel>();
    asSpy(utilService.openCommentModal).and.returnValue(resolveDisputeModal$.asObservable());
    component.disputeAction('Deny');

    // Assertions
    resolveDisputeModal$.subscribe(() => {
      expect(utilService.openCommentModal).toHaveBeenCalled();
      resolveDisputeResult$.next(invoice);
    });
    resolveDisputeResult$.subscribe(() => {
      expect(invoiceService.resolveDispute).toHaveBeenCalled();
      done();
    });

    // Run Test
    resolveDisputeModal$.next({comment: ''});
  });

  it('resolve dispute failure', done => {
    // Setup
    const resolveDisputeResult$ = new Subject<any>();
    asSpy(invoiceService.resolveDispute).and.returnValue(resolveDisputeResult$.asObservable());
    const resolveDisputeModal$ = new Subject<CommentModel>();
    asSpy(utilService.openCommentModal).and.returnValue(resolveDisputeModal$.asObservable());
    component.disputeAction('Accept');
    const TEST_DELETE_FAILURE = new Error('TEST DELETE FAILURE');

    // Assertions
    resolveDisputeModal$.subscribe(() => {
      expect(utilService.openCommentModal).toHaveBeenCalled();
      resolveDisputeResult$.error(TEST_DELETE_FAILURE);
    });
    resolveDisputeResult$.subscribe(response => {
        fail('Expected to receive error response, but was ' + response);
        done();
      },
      error => {
        expect(error).toBe(TEST_DELETE_FAILURE);
        done();
      }
    );

    // Run Test
    resolveDisputeModal$.next({comment: 'comments'});
  });

  describe('Not Implemented Button:', () => {
    const createHasNotBeenImplementedTest = (title: string, fnToTest: () => unknown) => {
      return (done: DoneFn) => {
        // Setup
        const errorModal$ = new Subject<boolean>();
        asSpy(utilService.openErrorModal).and.returnValue(errorModal$.asObservable());
        fnToTest();
        // Assertions
        errorModal$.subscribe(() => {
          expect(utilService.openErrorModal).toHaveBeenCalledWith({
            title,
            innerHtmlMessage: 'Not Yet Implemented On This Page'
          });
          done();
        });
        // Run Test
        errorModal$.next(false);
      };
    };
    it('#clickSaveAsTemplateButton', createHasNotBeenImplementedTest(
      'Save As Template', () => component.clickSaveAsTemplateButton()
    ));
  });

  it('should handle the weight adjustment modal', done => {
    // Setup
    const weightAdjustmentResult$ = new Subject<any>();
    const weightAdjustmentModal$ = new Subject<any>();
    asSpy(utilService.openWeightAdjustmentModal).and.returnValue(weightAdjustmentModal$.asObservable());
    component.handleWeightAdjustmentModalEvent(1);

    // Assertions
    weightAdjustmentModal$.subscribe(() => {
      expect(utilService.openWeightAdjustmentModal).toHaveBeenCalled();
      done();
    });

    // Run Test
    weightAdjustmentModal$.next({ currentWeight: 1.0 });
  });

  describe('clickSaveButton method', () => {

    const setUpControls = () => {
      component.tripInformationFormGroup.addControl('carrierMode', new FormControl({
        mode: 'TL',
        reportKeyMode: 'TL',
        reportModeDescription: 'TRUCKLOAD'
      }));
      component.tripInformationFormGroup.addControl('carrier', new FormControl({
        scac: 'ABCD',
        name: 'The ABCD Group',
      }));
      component.tripInformationFormGroup.addControl('serviceLevel', new FormControl({
        level: 'GRD',
        name: 'GROUND',
      }));
      component.tripInformationFormGroup.addControl('pickUpDate', new FormControl('2022-02-11'));
      component.invoiceAllocationFormGroup.addControl('invoiceAllocations', glLineItemFormArray);
      component.invoiceAmountFormGroup.addControl('amountOfInvoice', new FormControl('0'));
    };

    const setUpControlsForInvalidGlLineItems = () => {
      component.tripInformationFormGroup.addControl('carrierMode', new FormControl({
        mode: 'TL',
        reportKeyMode: 'TL',
        reportModeDescription: 'TRUCKLOAD'
      }));
      component.tripInformationFormGroup.addControl('carrier', new FormControl({
        scac: 'ABCD',
        name: 'The ABCD Group',
      }));
      component.tripInformationFormGroup.addControl('serviceLevel', new FormControl({
        level: 'GRD',
        name: 'GROUND',
      }));
      component.tripInformationFormGroup.addControl('pickUpDate', new FormControl('2022-02-11'));
      component.invoiceAllocationFormGroup.addControl('invoiceAllocations', invalidGlLineItemFormArray);
      component.invoiceAmountFormGroup.addControl('amountOfInvoice', new FormControl('0'));
    };

    it('should call performPostUpdateActions when update succeeds', () => {
      component.falconInvoiceNumber = 'F0000001234';
      const invoiceDataModel = new InvoiceDataModel();
      setUpControls();
      spyOn(component, 'performPostUpdateActions');
      spyOn(invoiceService, 'updateAutoInvoice').and.returnValue(of(invoiceDataModel));
      component.clickSaveButton();
      expect(component.performPostUpdateActions).toHaveBeenCalledOnceWith(
        `Success! Falcon Invoice ${component.falconInvoiceNumber} has been updated.`
      );
      expect(invoiceService.updateAutoInvoice).toHaveBeenCalledOnceWith(
        component.mapTripInformationToEditAutoInvoiceModel(), component.falconInvoiceNumber
      );
    });

    it('should not call performPostUpdateActions when update fails with invoice allocations invalid', () => {
      component.falconInvoiceNumber = 'F0000001234';
      const invoiceDataModel = new InvoiceDataModel();
      invoiceDataModel.glLineItemsInvalid = true;
      setUpControlsForInvalidGlLineItems();
      spyOn(component, 'performPostUpdateActions');
      spyOn(invoiceService, 'updateAutoInvoice').and.returnValue(of(invoiceDataModel));
      component.clickSaveButton();
      expect(component.performPostUpdateActions).not.toHaveBeenCalled();
      expect(invoiceService.updateAutoInvoice).toHaveBeenCalledOnceWith(
        component.mapTripInformationToEditAutoInvoiceModel(), component.falconInvoiceNumber
      );
    });

    it('should not call performPostUpdateActions when update fails', () => {
      component.falconInvoiceNumber = 'F0000001234';
      setUpControls();
      spyOn(component, 'performPostUpdateActions');
      spyOn(invoiceService, 'updateAutoInvoice').and.returnValue(throwError(new Error('Bad')));
      component.clickSaveButton();
      expect(component.performPostUpdateActions).not.toHaveBeenCalled();
      expect(invoiceService.updateAutoInvoice).toHaveBeenCalledOnceWith(
        component.mapTripInformationToEditAutoInvoiceModel(), component.falconInvoiceNumber
      );
    });

    it('should not call update or performPostUpdateActions when trip componenet carrierDetailsFound is false', () => {
      component.tripInformationComponent.carrierDetailFound = false;
      component.falconInvoiceNumber = 'F0000001234';
      const invoiceDataModel = new InvoiceDataModel();
      setUpControls();
      spyOn(component, 'performPostUpdateActions');
      spyOn(invoiceService, 'updateAutoInvoice').and.returnValue(of(invoiceDataModel));
      component.clickSaveButton();
      expect(component.performPostUpdateActions).not.toHaveBeenCalled();
      expect(invoiceService.updateAutoInvoice).not.toHaveBeenCalled();
    });
  });

  describe('clickSubmitForApprovalButton method', () => {

    const setUpControls = () => {
      component.tripInformationFormGroup.addControl('carrierMode', new FormControl({
        mode: 'TL',
        reportKeyMode: 'TL',
        reportModeDescription: 'TRUCKLOAD'
      }));
      component.tripInformationFormGroup.addControl('carrier', new FormControl({
        scac: 'ABCD',
        name: 'The ABCD Group',
      }));
      component.tripInformationFormGroup.addControl('serviceLevel', new FormControl({
        level: 'GRD',
        name: 'GROUND',
      }));
      component.tripInformationFormGroup.addControl('pickUpDate', new FormControl('2022-02-11'));
      component.invoiceAllocationFormGroup.addControl('invoiceAllocations', glLineItemFormArray);
      component.invoiceAmountFormGroup.addControl('amountOfInvoice', new FormControl('0'));
    };

    it('should call performPostUpdateActions when both update and submit for approval succeeds', () => {
      component.falconInvoiceNumber = 'F0000001234';
      const invoiceDataModel = new InvoiceDataModel();
      invoiceDataModel.falconInvoiceNumber = 'F0000005678';
      setUpControls();
      spyOn(component, 'performPostUpdateActions');
      spyOn(invoiceService, 'updateAutoInvoice').and.returnValue(of(invoiceDataModel));
      spyOn(invoiceService, 'submitForApproval').and.returnValue(of({}));
      component.clickSubmitForApprovalButton();
      expect(component.performPostUpdateActions).toHaveBeenCalledOnceWith(
        `Success! Falcon Invoice ${component.falconInvoiceNumber} has been updated and submitted for approval.`
      );
      expect(invoiceService.updateAutoInvoice).toHaveBeenCalledOnceWith(
        component.mapTripInformationToEditAutoInvoiceModel(), component.falconInvoiceNumber
      );
      expect(invoiceService.submitForApproval).toHaveBeenCalledOnceWith(invoiceDataModel.falconInvoiceNumber);
    });

    it('should not call performPostUpdateActions or submitForApproval when update fails', () => {
      component.falconInvoiceNumber = 'F0000001234';
      setUpControls();
      spyOn(component, 'performPostUpdateActions');
      spyOn(invoiceService, 'updateAutoInvoice').and.returnValue(throwError(new Error('Bad')));
      spyOn(invoiceService, 'submitForApproval').and.returnValue(of({}));
      component.clickSubmitForApprovalButton();
      expect(component.performPostUpdateActions).not.toHaveBeenCalled();
      expect(invoiceService.updateAutoInvoice).toHaveBeenCalledOnceWith(
        component.mapTripInformationToEditAutoInvoiceModel(), component.falconInvoiceNumber
      );
      expect(invoiceService.submitForApproval).not.toHaveBeenCalled();
    });

    it('should not call performPostUpdateActions when update succeeds and submit for approval fails', () => {
      component.falconInvoiceNumber = 'F0000001234';
      const invoiceDataModel = new InvoiceDataModel();
      invoiceDataModel.falconInvoiceNumber = 'F0000005678';
      setUpControls();
      spyOn(component, 'performPostUpdateActions');
      spyOn(invoiceService, 'updateAutoInvoice').and.returnValue(of(invoiceDataModel));
      spyOn(invoiceService, 'submitForApproval').and.returnValue(throwError(new Error('Bad')));
      component.clickSubmitForApprovalButton();
      expect(component.performPostUpdateActions).not.toHaveBeenCalled();
      expect(invoiceService.updateAutoInvoice).toHaveBeenCalledOnceWith(
        component.mapTripInformationToEditAutoInvoiceModel(), component.falconInvoiceNumber
      );
      expect(invoiceService.submitForApproval).toHaveBeenCalledOnceWith(invoiceDataModel.falconInvoiceNumber);
    });

    it('should not invoke update, submit for approval or performPostUpdateActions when trip information carrierDetailsFound is false',
      () => {
        component.tripInformationComponent.carrierDetailFound = false;
        component.falconInvoiceNumber = 'F0000001234';
        const invoiceDataModel = new InvoiceDataModel();
        invoiceDataModel.falconInvoiceNumber = 'F0000005678';
        setUpControls();
        spyOn(component, 'performPostUpdateActions');
        spyOn(invoiceService, 'updateAutoInvoice').and.returnValue(of(invoiceDataModel));
        spyOn(invoiceService, 'submitForApproval').and.returnValue(of({}));
        component.clickSubmitForApprovalButton();
        expect(component.performPostUpdateActions).not.toHaveBeenCalled();
        expect(invoiceService.updateAutoInvoice).not.toHaveBeenCalled();
        expect(invoiceService.submitForApproval).not.toHaveBeenCalled();
      });

  });

  describe('performPostUpdateActions method', () => {

    it('should call ngOnInit and openSuccessToast when invoked', () => {
      const successMessage = 'I am a success message';
      spyOn(component, 'ngOnInit');

      component.performPostUpdateActions(successMessage);

      expect(component.ngOnInit).toHaveBeenCalledOnceWith();
      expect(toastService.openSuccessToast).toHaveBeenCalledOnceWith(successMessage);

    });
  });

  describe('mapTripInformationToEditAutoInvoiceModel method', () => {

    const setUpControls = () => {
      component.tripInformationFormGroup.addControl('carrierMode', new FormControl({
        mode: 'TL',
        reportKeyMode: 'TL',
        reportModeDescription: 'TRUCKLOAD'
      }));
      component.tripInformationFormGroup.addControl('carrier', new FormControl({
        scac: 'ABCD',
        name: 'The ABCD Group',
      }));
      component.tripInformationFormGroup.addControl('serviceLevel', new FormControl({
        level: 'GRD',
        name: 'GROUND',
      }));
      component.tripInformationFormGroup.addControl('pickUpDate', new FormControl('2022-02-11'));
      component.invoiceAllocationFormGroup.addControl('invoiceAllocations', glLineItemFormArray);
      component.invoiceAmountFormGroup.addControl('amountOfInvoice', new FormControl('0'));
      component.tripInformationFormGroup.controls.originAddress = originAddressFormGroup;
    };

    it('should return EditAutoInvoiceModel object', () => {
      setUpControls();
      const result = component.mapTripInformationToEditAutoInvoiceModel();
      expect(result).toEqual({
        amountOfInvoice: component.invoiceAmountFormGroup.controls.amountOfInvoice.value,
        totalGrossWeight: component.tripInformationFormGroup.controls.totalGrossWeight.value,
        mode: {
          mode: component.tripInformationFormGroup.controls.carrierMode.value.mode,
          reportKeyMode: component.tripInformationFormGroup.controls.carrierMode.value.reportKeyMode,
          reportModeDescription: component.tripInformationFormGroup.controls.carrierMode.value.reportModeDescription
        },
        carrier: {
          scac: component.tripInformationFormGroup.controls.carrier.value.scac,
          name: component.tripInformationFormGroup.controls.carrier.value.name,
        },
        serviceLevel: {
          level: component.tripInformationFormGroup.controls.serviceLevel.value,
          name: component.invoice.serviceCode,
        },
        pickupDateTime: component.tripInformationFormGroup.controls.pickUpDate.value,
        glLineItemList: component.invoiceAllocationFormGroup.controls.invoiceAllocations.value,
        costLineItems: component.getLineItems(component.invoiceAmountFormGroup.controls.costBreakdownItems),
        pendingChargeLineItems: component.getLineItems(component.invoiceAmountFormGroup.controls.pendingChargeLineItems),
        disputeLineItems: component.getDisputeLineItems(component.invoiceAmountFormGroup.controls.disputeLineItems),
        deniedChargeLineItems: component.getLineItems(component.invoiceAmountFormGroup.controls.deniedChargeLineItems),
        deletedChargeLineItems: component.getLineItems(component.invoiceAmountFormGroup.controls.deletedChargeLineItems),
        originAddress: LocationUtils.extractLocation(component.tripInformationFormGroup.controls.originAddress as FormGroup, 'origin'),
        destinationAddress: LocationUtils.extractLocation(component.tripInformationFormGroup.controls.destinationAddress as FormGroup, 'destination', component.invoice.destination.code),
        billToAddress: BillToLocationUtils.extractBillToLocation(component.tripInformationFormGroup.controls.billToAddress as FormGroup),
        shippingPoint: (component.tripInformationFormGroup.controls.originAddress as FormGroup)?.controls?.shippingPoint?.value
      });
    });
  });

  describe('with populated sub forms', () => {
    beforeEach(() => {
      component.tripInformationFormGroup.controls.carrierMode = new FormControl(TEST_MODE);
      component.tripInformationFormGroup.controls.carrier = new FormControl(TEST_CARRIER);
      component.tripInformationFormGroup.controls.billToAddress = billToAddressFormGroup;
      const costBreakdownItems = component.invoiceAmountFormGroup.controls.costBreakdownItems = new FormArray([]);
      costBreakdownItems.push(new FormGroup({
        accessorial: new FormControl(false),
        accessorialCode: new FormControl('Test Accessorial Code'),
        charge: new FormControl('Test Charge Code'),
        rateSource: new FormControl('Test Rate Source Label'),
        rateSourcePair: new FormControl({key: 'Test Rate Source Key', label: 'Test Rate Source Label'}),
        entrySource: new FormControl('Test Entry Source Label'),
        entrySourcePair: new FormControl({key: 'Test Entry Source Key', label: 'Test Entry Source Label'}),
        rate: new FormControl(123.45),
        type: new FormControl('Test Type'),
        quantity: new FormControl(1),
        totalAmount: new FormControl(123.45),
        requestStatus: new FormControl('Test Request Status Label'),
        message: new FormControl('Test Message'),
        createdBy: new FormControl('Test Created By'),
        createdDate: new FormControl(TEST_DATE),
        closedBy: new FormControl('Test Close By'),
        closedDate: new FormControl(TEST_DATE),
        carrierComment: new FormControl('Test Carrier Comment'),
        responseComment: new FormControl('Test Response Comment'),
        rateResponse: new FormControl('Test Rate Response'),
        autoApproved: new FormControl(true),
        attachmentRequired: new FormControl(true),
        planned: new FormControl(true),
        fuel: new FormControl(true),
        manual: new FormControl(true),
        lineItemType: new FormControl('Test Line Item Type')
      }));
      component.updateInvoiceFromForms();
    });
    it('should have mode', () => {
      expect(component.invoice.mode).toEqual(TEST_MODE);
    });
    it('should have carrier ', () => {
      expect(component.invoice.carrier).toEqual(TEST_CARRIER);
    });
    it('should have origin', () => {
      component.tripInformationFormGroup.controls.originAddress = originAddressFormGroup;
      component.updateInvoiceFromForms();
      expect(component.invoice.origin).toEqual(MOCK_LOCATION);
    });
    it('should have origin with no shipping control', () => {
      component.tripInformationFormGroup.controls.originAddress = new FormGroup({});
      component.updateInvoiceFromForms();
      expect(component.invoice.origin).toEqual({
        name: undefined as any,
        city: undefined as any,
        country: undefined as any,
        zipCode: undefined as any,
        state: undefined as any,
        address: undefined as any,
        address2: undefined as any,
        code: undefined as any
      });
    });
    it('should have destination', () => {
      component.tripInformationFormGroup.controls.destinationAddress = destinationAddressFormGroup;
      component.invoice.destination.code = MOCK_LOCATION.code;
      component.updateInvoiceFromForms();
      expect(component.invoice.destination).toEqual(MOCK_LOCATION);
    });
    it('should have costLineItems', () => {
      expect(component.invoice.costLineItems.length).toEqual(1);
    });
  });

  it('should load bad data', () => {
    const badInvoice = new InvoiceDataModel();
    badInvoice.vendorNumber = null as any;
    badInvoice.pickupDateTime = TEST_DATE;
    badInvoice.createdDate = null as any;
    badInvoice.deliveryDateTime = TEST_DATE;
    badInvoice.proNumber = 'PRONUMBER';
    badInvoice.billOfLadingNumber = 'BILLOFLADINGNUMBER';
    badInvoice.overriddenDeliveryDateTime = '';
    badInvoice.assumedDeliveryDateTime = '';
    badInvoice.carrier = null as any;
    badInvoice.mode = null as any;
    component.loadInvoice(badInvoice);
    // no error means we pass
  });

  it('should get bad cost line item data', () => {
    const costBreakdownItems = component.invoiceAmountFormGroup.controls.costBreakdownItems = new FormArray([]);
    costBreakdownItems.clear();
    costBreakdownItems.push(new FormControl());
    const results = component.getLineItems(costBreakdownItems);
    expect(results.length).toBe(1);
  });

  it('should get bad dispute line item data', () => {
    const disputeBreakdownItems = component.invoiceAmountFormGroup.controls.disputeLineItems = new FormArray([]);
    disputeBreakdownItems.clear();
    disputeBreakdownItems.push(new FormControl());
    const results = component.getDisputeLineItems(disputeBreakdownItems);
    expect(results.length).toBe(1);
  });

  it('should get empty list on missing control', () => {
    component.invoiceAmountFormGroup.controls.costBreakdownItems = new FormControl('');
    const results = component.getLineItems(component.invoiceAmountFormGroup.controls.costBreakdownItems);
    expect(results.length).toBe(0);
  });

  it('should get empty list on missing control for dispute', () => {
    component.invoiceAmountFormGroup.controls.disputeLineItems = new FormControl('');
    const results = component.getDisputeLineItems(component.invoiceAmountFormGroup.controls.costDisputeItems);
    expect(results.length).toBe(0);
  });

  it('onGlAllocationRequestEvent should call backend api', done => {
    const mockGlAllocateRequest$ = new Subject();
    spyOn(component, 'updateInvoiceFromForms').and.stub();
    spyOn(component, 'loadInvoice').and.stub();
    asSpy(rateService.glAllocateInvoice).and.returnValue(mockGlAllocateRequest$.asObservable());
    component.onGlAllocationRequestEvent(true);
    mockGlAllocateRequest$.subscribe(() => {
      expect(component.updateInvoiceFromForms).toHaveBeenCalled();
      expect(component.loadInvoice).toHaveBeenCalled();
      done();
    });
    mockGlAllocateRequest$.next({});
  });

  it('updateAndGetRates should call backend api', done => {
    const mockUpdateRequest$ = new Subject();
    spyOn(component, 'updateInvoiceFromForms').and.stub();
    spyOn(component, 'loadInvoice').and.stub();
    asSpy(rateService.updateInvoice).and.returnValue(mockUpdateRequest$.asObservable());
    component.updateAndGetRates();
    mockUpdateRequest$.subscribe(() => {
      expect(component.updateInvoiceFromForms).toHaveBeenCalled();
      expect(component.loadInvoice).toHaveBeenCalled();
      done();
    });
    mockUpdateRequest$.next({});
  });

});
