import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InvoiceEditPageComponent} from './invoice-edit-page.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {of, Subject} from 'rxjs';
import {InvoiceService} from '../../services/invoice-service';
import {MockParamMap} from '../../testing/test-utils';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {ToastService, UserInfo} from '@elm/elm-styleguide-ui';
import {UserService} from '../../services/user-service';
import {asSpy} from '../../testing/test-utils.spec';
import {UtilService} from '../../services/util-service';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {RateService} from '../../services/rate-service';

describe('InvoiceEditPageComponent', () => {

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
      declarations: [InvoiceEditPageComponent]
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

    // Mock User Service
    userService = TestBed.inject(UserService);
    spyOn(userService, 'getUserInfo').and.returnValue(of());

    // Mock Util Service
    utilService = TestBed.inject(UtilService);
    spyOn(utilService, 'openErrorModal').and.returnValue(of());
    spyOn(utilService, 'openConfirmationModal').and.returnValue(of(true));
    spyOn(utilService, 'openDeleteModal').and.returnValue(of('deleteReason'));

    // Mock Toast Service
    toastService = TestBed.inject(ToastService);
    spyOn(toastService, 'openErrorToast').and.stub();

    // Mock Web Service
    rateService = TestBed.inject(RateService);
    spyOn(rateService, 'getAccessorialDetails').and.returnValue(of());
    spyOn(rateService, 'getRates').and.returnValue(of());

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
          standardPaymentTermsOverride: '',
          status: {key: 'FAKE', label: 'Fake Status'},
          vendorNumber: '123',
          workType: 'TestWorkType',
          milestones: [{
            type: {key: 'TEST', label: 'Test Milestone'},
            timestamp: new Date().toISOString(),
            user: 'Test User'
          }]
        };
        asSpy(invoiceService.getInvoice).and.returnValue(of(testInvoice));
      });
      it('getAccessorialList should call rate engine', () => {
        const newInvoice = new InvoiceDataModel();
        component.getAccessorialList(newInvoice);
        expect(rateService.getAccessorialDetails).toHaveBeenCalled();
      });
      it('getAccessorialList should not call rate engine', () => {
        component.getAccessorialList(testInvoice);
        expect(rateService.getAccessorialDetails).not.toHaveBeenCalled();
      });
      it('getRates should call rate engine', () => {
        component.invoice = new InvoiceDataModel();
        component.getRates('testAccessorialCode');
        expect(rateService.getRates).toHaveBeenCalled();
      });
      it('getRates should not call rate engine', () => {
        testInvoice.carrier = null;
        component.invoice = testInvoice;
        component.getRates('testAccessorialCode');
        expect(rateService.getRates).not.toHaveBeenCalled();
      });

      it('handle getRates response', done => {
        // Setup
        const ratesResponse$ = new Subject<any>();
        asSpy(rateService.getRates).and.returnValue(ratesResponse$.asObservable());
        component.invoice = new InvoiceDataModel();
        component.getRates('testAccessorialCode');

        // Assertions
        ratesResponse$.subscribe(() => {
          expect(rateService.getRates).toHaveBeenCalled();
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

  it('#clickToggleEditMode should toggle isEditMode$', () => {
    const initialValue = component.isEditMode$.value;
    component.clickToggleEditMode();
    expect(component.isEditMode$.value).toEqual(!initialValue);
  });

  it('#clickToggleEditMode should call rate engine for accessorial details', done => {
    // Setup
    const getAccessorialDetails$ = new Subject<any>();
    asSpy(rateService.getAccessorialDetails).and.returnValue(getAccessorialDetails$.asObservable());
    component.invoice = new InvoiceDataModel();
    component.clickToggleEditMode();

    // Assertions
    getAccessorialDetails$.subscribe(() => {
      expect(rateService.getAccessorialDetails).toHaveBeenCalled();
      done();
    });

    // Run Test
    getAccessorialDetails$.next(true);
  });

  it('#clickToggleMilestoneTab should toggle isMilestoneTabOpen', () => {
    const initialValue = component.isMilestoneTabOpen;
    component.clickToggleMilestoneTab();
    expect(component.isMilestoneTabOpen).toEqual(!initialValue);
  });

  it('#clickCancelButton should call router to navigate to invoice list', () => {
    component.clickCancelButton();
    expect(router.navigate).toHaveBeenCalledWith(['/invoices']);
  });

  it('#clickDeleteButton', done => {
    // Setup
    const deleteInvoice$ = new Subject<any>();
    asSpy(invoiceService.deleteInvoice).and.returnValue(deleteInvoice$.asObservable());
    const confirmationModal$ = new Subject<boolean>();
    asSpy(utilService.openConfirmationModal).and.returnValue(confirmationModal$.asObservable());
    component.clickDeleteButton();
    const TEST_DELETE_FAILURE = new Error('TEST DELETE FAILURE');

    // Assertions
    confirmationModal$.subscribe(() => {
      expect(utilService.openConfirmationModal).toHaveBeenCalled();
      deleteInvoice$.error(TEST_DELETE_FAILURE);
    });
    deleteInvoice$.subscribe(response => {
        fail('Expected to receive error response, but was ' + response);
        done();
      },
      error => {
        expect(error).toBe(TEST_DELETE_FAILURE);
        done();
      }
    );

    // Run Test
    confirmationModal$.next(true);
  });

  it('#clickDeleteButton with deleted reason', done => {
    // Setup
    component.isAutoInvoice = true;
    component.isApprovedInvoice = true;
    const deleteInvoiceWithReason$ = new Subject<any>();
    asSpy(invoiceService.deleteInvoiceWithReason).and.returnValue(deleteInvoiceWithReason$.asObservable());
    const deleteModal$ = new Subject<string>();
    asSpy(utilService.openDeleteModal).and.returnValue(deleteModal$.asObservable());
    component.clickDeleteButton();

    // Assertions
    deleteModal$.subscribe(() => {
      expect(utilService.openDeleteModal).toHaveBeenCalled();
      deleteInvoiceWithReason$.next();
    });
    deleteInvoiceWithReason$.subscribe(() => {
      expect(invoiceService.deleteInvoiceWithReason).toHaveBeenCalled();
      done();
    });

    // Run Test
    deleteModal$.next('deleteReason');
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
    it('#clickSaveButton', createHasNotBeenImplementedTest(
      'Save Invoice', () => component.clickSaveButton()
    ));
    it('#clickSubmitForApprovalButton', createHasNotBeenImplementedTest(
      'Submit For Approval', () => component.clickSubmitForApprovalButton()
    ));
  });

});
