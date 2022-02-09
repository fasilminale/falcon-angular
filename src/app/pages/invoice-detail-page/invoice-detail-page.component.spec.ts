import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InvoiceDetailPageComponent} from './invoice-detail-page.component';
import {HttpTestingController} from '@angular/common/http/testing';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {RouterTestingModule} from '@angular/router/testing';
import {LoadingService} from '../../services/loading-service';
import {of, Subject} from 'rxjs';
import {environment} from '../../../environments/environment';
import {InvoiceFormComponent} from '../../components/invoice-form/invoice-form.component';
import {TemplateService} from '../../services/template-service';
import {Router} from '@angular/router';
import {TimeService} from '../../services/time-service';
import {Template} from '../../models/template/template-model';
import {By} from '@angular/platform-browser';
import {ButtonModule, ElmButtonComponent, ElmTextareaInputComponent} from '@elm/elm-styleguide-ui';
import {InvoiceFormManager} from '../../components/invoice-form/invoice-form-manager';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {UserService} from '../../services/user-service';
import {asSpy} from '../../testing/test-utils.spec';

describe('InvoiceDetailPageComponent', () => {
  const MOCK_CONFIRM_DIALOG = jasmine.createSpyObj({
    afterClosed: of(true),
    close: null
  });

  const MOCK_DENY_DIALOG = jasmine.createSpyObj({
    afterClosed: of(false),
    close: null
  });

  const userInfo = {
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
    uid: '12345',
    role: 'FAL_INTERNAL_WRITE',
    permissions: [
      'falAllowInvoiceAccess'
    ]
  };

  const falconInvoiceNumber = 'F0000000001';
  const invoiceResponse = {
    falconInvoiceNumber: 'F0000000001',
    amountOfInvoice: 2999.99,
    attachments: [
      {
        file: {
          name: 'test'
        }
      }
    ],
    milestones: [{
      type: {
        key: 'CREATED',
        label: 'Invoice Created'
      },
      timestamp: '2021-04-19T19:58:41.765Z',
      user: 'Falcon User',
      comments: ''
    }, {
      type: {
        key: 'CREATED',
        label: 'Invoice Created'
      },
      timestamp: '2021-04-20T20:58:41.765Z',
      user: 'Falcon User',
      comments: ''
    }],
    lineItems: [
      {
        lineItemNetAmount: 2999.99
      }
    ]
  };

  let component: InvoiceDetailPageComponent;
  let fixture: ComponentFixture<InvoiceDetailPageComponent>;
  let http: HttpTestingController;
  let snackBar: MatSnackBar;
  let loadingService: LoadingService;
  let dialog: MatDialog;
  let router: Router;
  let time: TimeService;
  let templateService: TemplateService;
  let form: InvoiceFormManager;
  let userService: UserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        RouterTestingModule,
        ButtonModule,
      ],
      declarations: [
        InvoiceDetailPageComponent,
        InvoiceFormComponent,
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);
    dialog = TestBed.inject(MatDialog);
    loadingService = TestBed.inject(LoadingService);
    time = TestBed.inject(TimeService);
    templateService = TestBed.inject(TemplateService);
    userService = TestBed.inject(UserService);
    spyOn(templateService, 'getTemplates').and.returnValue(of([]));
    spyOn(templateService, 'getTemplateByName').and.returnValue(of({lineItems: []} as unknown as Template));
    spyOn(userService, 'getUserInfo').and.returnValue(of(userInfo));
    form = TestBed.inject(InvoiceFormManager);
    spyOn(form, 'establishTouchLink').and.stub();
    spyOn(form, 'forceValueChangeEvent').and.stub();
    fixture = TestBed.createComponent(InvoiceDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.falconInvoiceNumber = falconInvoiceNumber;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    expect(component).toBeTruthy();
  });

  it('should toggle the milestones sidenav', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    component.toggleMilestones();
    expect(component.milestonesTabOpen).toBeTrue();
  });

  it('should update the milestones sidenav', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'updateMilestones').and.callThrough();
    component.updateMilestones(invoiceResponse.milestones);
    expect(component.updateMilestones).toHaveBeenCalled();
  });

  it('should update the readOnly flag', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'editInvoice').and.callThrough();
    component.editInvoice();
    expect(component.readOnly).toBeFalsy();
  });

  it('should update the isSubmittedInvoice flag', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'submittedInvoice').and.callThrough();
    component.submittedInvoice(true);
    expect(component.isSubmittedInvoice).toBeTruthy();
  });

  it('should update the isAutoInvoice flag', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'autoInvoice').and.callThrough();
    component.autoInvoice(true);
    expect(component.isAutoInvoice).toBeTruthy();
  });

  it('should update the isApprovedInvoice flag', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'approvedInvoice').and.callThrough();
    component.approvedInvoice(true);
    expect(component.isApprovedInvoice).toBeTruthy();
  });

  it('should update the isRejectedInvoice flag', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'rejectedInvoice').and.callThrough();
    component.rejectedInvoice(true);
    expect(component.isRejectedInvoice).toBeTruthy();
  });

  it('should call delete invoice route after confirming delete invoice', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(router, 'navigate').and.stub();
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    component.deleteInvoice();
    expect(dialog.open).toHaveBeenCalled();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should cancel deleting an invoice', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'deleteInvoice').and.callThrough();
    spyOn(dialog, 'open').and.returnValue(MOCK_DENY_DIALOG);
    component.deleteInvoice();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should fail to delete an invoice', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'deleteInvoice').and.callThrough();
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    component.deleteInvoice();
    expect(dialog.open).toHaveBeenCalled();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .error(new ErrorEvent('Delete Invoice Failed'));
  });

  it('should call save template', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'saveAsTemplate').and.callThrough();
    component.saveAsTemplate();
    expect(component.saveAsTemplate).toHaveBeenCalled();
  });

  it('should call disableInvoice', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'disableInvoice').and.callThrough();
    component.disableInvoice(true);
    expect(component.isDeletedInvoice).toBeTruthy();
  });

  it('should call formatTimestamp', () => {
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'formatTimestamp').and.callThrough();
    component.formatTimestamp('2021-05-14T11:01:58.135Z');
    expect(component.formatTimestamp).toHaveBeenCalled();
  });

  it('should click delete button', async () => {
    component.isDeletedInvoice = false;
    component.hasInvoiceWrite = true;
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(router, 'navigate').and.stub();
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    const deleteInvoiceSpy = spyOn(component, 'deleteInvoice');

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const deleteBtn = fixture.debugElement.query(By.css('#delete-button')).context as ElmButtonComponent;
      deleteBtn.buttonClick.emit();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(deleteInvoiceSpy).toHaveBeenCalled();
        spyOn(router, 'navigate').and.stub();
        spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
      });
    });
  });

  it('should delete invoice with reason', async (done) => {
    component.isDeletedInvoice = false;
    component.hasInvoiceWrite = true;
    component.isAutoInvoice = true;
    component.isApprovedInvoice = true;
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(component, 'requireDeleteReason').and.callThrough();
    spyOn(router, 'navigate').and.stub();
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    spyOn(component.util, 'openDeleteModal').and.callThrough();

    component.deleteInvoice();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}/delete`)
        .flush(invoiceResponse);
      done();
    });
  });
});
