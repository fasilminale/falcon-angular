import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InvoiceDetailPageComponent} from './invoice-detail-page.component';
import {WebServices} from '../../services/web-services';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {RouterTestingModule} from '@angular/router/testing';
import {LoadingService} from '../../services/loading-service';
import {of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpResponse} from '@angular/common/http';
import {InvoiceFormComponent} from '../../components/invoice-form/invoice-form.component';
import {ApiService} from '../../services/api-service';
import {UtilService} from '../../services/util-service';

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

  let component: InvoiceDetailPageComponent;
  let fixture: ComponentFixture<InvoiceDetailPageComponent>;
  let http: HttpTestingController;
  let snackBar: MatSnackBar;
  let loadingService: LoadingService;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, NoopAnimationsModule, MatDialogModule],
      declarations: [InvoiceDetailPageComponent, InvoiceFormComponent],
      providers: [WebServices, ApiService, UtilService, MatDialog, LoadingService, MatSnackBar],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    dialog = TestBed.inject(MatDialog);
    loadingService = TestBed.inject(LoadingService);
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
    expect(component).toBeTruthy();
  });

  it('should toggle the milestones sidenav', () => {
    component.toggleMilestones();
    expect(component.milestonesTabOpen).toBeTrue();
  });

  it('should update the milestones sidenav', () => {
    spyOn(component, 'updateMilestones').and.callThrough();
    component.updateMilestones({});
    expect(component.updateMilestones).toHaveBeenCalled();
  });

  it('should update the readOnly flag', () => {
    spyOn(component, 'editInvoice').and.callThrough();
    component.editInvoice();
    expect(component.readOnly).toBeFalsy();
  });

  it('should call delete invoice route after confirming delete invoice', () => {
    spyOn(component, 'deleteInvoice').and.callThrough();
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    component.deleteInvoice();
    expect(dialog.open).toHaveBeenCalled();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`).flush(new HttpResponse<never>());
  });

  it('should cancel deleting an invoice', () => {
    spyOn(component, 'deleteInvoice').and.callThrough();
    spyOn(dialog, 'open').and.returnValue(MOCK_DENY_DIALOG);
    component.deleteInvoice();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should fail to delete an invoice', () => {
    spyOn(component, 'deleteInvoice').and.callThrough();
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    component.deleteInvoice();
    expect(dialog.open).toHaveBeenCalled();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${falconInvoiceNumber}`).error(new ErrorEvent('Delete Invoice Failed'));
  });

  it('should call save template', () => {
    spyOn(component, 'saveAsTemplate').and.callThrough();
    component.saveAsTemplate();
    expect(component.saveAsTemplate).toHaveBeenCalled();
  });

  it('should call disableInvoice', () => {
    spyOn(component, 'disableInvoice').and.callThrough();
    component.disableInvoice(true);
    expect(component.isDeletedInvoice).toBeTruthy();
  });
});
