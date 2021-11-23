import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InvoiceEditPageComponent} from './invoice-edit-page.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {of, Subject} from 'rxjs';
import {InvoiceService} from '../../services/invoice-service';
import {MockParamMap} from '../../testing/test-utils';
import {FalUserInfo} from '../../models/user-info/user-info-model';
import {UserInfo} from '@elm/elm-styleguide-ui';
import {UserService} from '../../services/user-service';
import {asSpy} from '../../testing/test-utils.spec';
import {Invoice} from '../../models/invoice/invoice-model';
import {UtilService} from '../../services/util-service';

describe('InvoiceEditPageComponent', () => {

  let component: InvoiceEditPageComponent;
  let fixture: ComponentFixture<InvoiceEditPageComponent>;

  let route: ActivatedRoute;
  let routeParamMap$: Subject<ParamMap>;
  let invoiceService: InvoiceService;
  let userService: UserService;
  let utilService: UtilService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [InvoiceEditPageComponent]
    }).compileComponents();

    // Mock ActivatedRoute
    route = TestBed.inject(ActivatedRoute);
    routeParamMap$ = new Subject<ParamMap>();
    spyOnProperty(route, 'paramMap', 'get')
      .and.returnValue(routeParamMap$.asObservable());

    // Mock Invoice Service
    invoiceService = TestBed.inject(InvoiceService);
    spyOn(invoiceService, 'getInvoice').and.returnValue(of());

    // Mock User Service
    userService = TestBed.inject(UserService);
    spyOn(userService, 'getUserInfo').and.returnValue(of());

    // Mock Util Service
    utilService = TestBed.inject(UtilService);
    spyOn(utilService, 'openErrorModal').and.returnValue(of());

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
      let testInvoice: Invoice;
      beforeEach(() => {
        testInvoice = {
          amountOfInvoice: 1234.56,
          attachments: [],
          comments: 'Test Comment',
          companyCode: 'TestCompanyCode',
          createdBy: 'Test User',
          currency: 'USD',
          erpType: 'TPM',
          externalInvoiceNumber: 'EXT1',
          failedToCreate: false,
          falconInvoiceNumber: 'TestFalconInvoiceNumber',
          invoiceDate: new Date().toISOString(),
          lineItems: [],
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
      it('should not be submitted invoice', done => {
        // Assertions
        routeParamMap$.subscribe(() => {
          expect(component.isSubmittedInvoice).toBeTrue();
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
    const testUser: FalUserInfo = {
      firstName: 'Test',
      lastName: 'User',
      role: 'TEST_ROLE',
      permissions: []
    };
    component.ngOnInit();
    // Assertions
    getUserInfo$.subscribe(() => {
      expect(component.userInfo).toBe(testUser);
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

  it('#clickToggleMilestoneTab should toggle isMilestoneTabOpen', () => {
    const initialValue = component.isMilestoneTabOpen;
    component.clickToggleMilestoneTab();
    expect(component.isMilestoneTabOpen).toEqual(!initialValue);
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
    it('#clickDeleteButton', createHasNotBeenImplementedTest(
      'Delete Invoice', () => component.clickDeleteButton()
    ));
    it('#clickCancelButton', createHasNotBeenImplementedTest(
      'Cancel Editing', () => component.clickCancelButton()
    ));
    it('#clickSaveButton', createHasNotBeenImplementedTest(
      'Save Invoice', () => component.clickSaveButton()
    ));
    it('#clickSubmitForApprovalButton', createHasNotBeenImplementedTest(
      'Submit For Approval', () => component.clickSubmitForApprovalButton()
    ));
  });

});
