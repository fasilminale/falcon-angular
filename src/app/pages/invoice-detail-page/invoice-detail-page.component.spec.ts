import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {InvoiceDetailPageComponent} from './invoice-detail-page.component';
import {WebServices} from '../../services/web-services';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {RouterTestingModule} from '@angular/router/testing';
import {LoadingService} from '../../services/loading-service';
import {of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {InvoiceFormComponent} from '../../components/invoice-form/invoice-form.component';
import {InvoiceService} from '../../services/invoice-service';
import {AttachmentService} from '../../services/attachment-service';
import {TemplateService} from '../../services/template-service';
import {UtilService} from '../../services/util-service';
import {Router} from '@angular/router';
import {TimeService} from '../../services/time-service';
import {Template} from '../../models/template/template-model';
import {By } from '@angular/platform-browser';
import {ButtonModule, ElmButtonComponent } from '@elm/elm-styleguide-ui';

describe('InvoiceDetailPageComponent', () => {
  const MOCK_CONFIRM_DIALOG = jasmine.createSpyObj({
    afterClosed: of(true),
    close: null
  });

  const MOCK_DENY_DIALOG = jasmine.createSpyObj({
    afterClosed: of(false),
    close: null
  });

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
      status: 'CREATED',
      timestamp: '2021-04-19T19:58:41.765Z',
      user: 'Falcon User'
    }, {
      status: 'CREATED',
      timestamp: '2021-04-20T20:58:41.765Z',
      user: 'Falcon User'
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        MatDialogModule,
        ButtonModule
      ],
      declarations: [
        InvoiceDetailPageComponent,
        InvoiceFormComponent
      ],
      providers: [
        WebServices,
        InvoiceService,
        AttachmentService,
        TemplateService,
        UtilService,
        MatDialog,
        LoadingService,
        MatSnackBar,
        TimeService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);
    dialog = TestBed.inject(MatDialog);
    loadingService = TestBed.inject(LoadingService);
    time = TestBed.inject(TimeService);
    templateService = TestBed.inject(TemplateService);
    spyOn(templateService, 'getTemplates').and.returnValue(of([]));
    spyOn(templateService, 'getTemplateByName').and.returnValue(of({lineItems: []} as unknown as Template));
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
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`)
      .flush(invoiceResponse);
    spyOn(router, 'navigate').and.stub();
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    const deleteInvoiceSpy = spyOn(component, 'deleteInvoice');

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
