import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InvoiceCreatePageComponent} from './invoice-create-page.component';
import {WebServices} from '../../services/web-services';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../../environments/environment';
import {HttpResponse} from '@angular/common/http';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {of} from 'rxjs';

describe('InvoiceCreatePageComponent', () => {

  const MOCK_CONFIRM_DIALOG = jasmine.createSpyObj({
    afterClosed: of(true),
    close: null
  });

  const MOCK_DENY_DIALOG = jasmine.createSpyObj({
    afterClosed: of(false),
    close: null
  });

  let component: InvoiceCreatePageComponent;
  let fixture: ComponentFixture<InvoiceCreatePageComponent>;
  let http: HttpTestingController;
  let snackBar: MatSnackBar;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule, NoopAnimationsModule, MatDialogModule],
      declarations: [InvoiceCreatePageComponent],
      providers: [WebServices, MatSnackBar, MatDialog],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(InvoiceCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show success snackbar on post', () => {
    spyOn(component, 'openSnackBar').and.stub();
    component.onSubmit();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice`)
      .flush(new HttpResponse<never>());
    expect(component.openSnackBar)
      .toHaveBeenCalledWith('Success, invoice created!');
  });

  it('should show failure snackbar on failed post', () => {
    spyOn(component, 'openSnackBar').and.stub();
    component.onSubmit();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice`)
      .error(new ErrorEvent('test error event'), {
        status: 123,
        statusText: 'test status text'
      });
    expect(component.openSnackBar)
      .toHaveBeenCalledWith('Failure, invoice was not created!');
  });

  it('should called material snackbar when openSnackBar method called', () => {
    spyOn(snackBar, 'open').and.stub();
    component.openSnackBar('test message');
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('should enable remove button after going up to more than one line item', () => {
    component.addNewEmptyLineItem();
    expect(component.lineItemRemoveButtonDisable).toBeFalse();
  });

  it('should disable remove button after going down to one line item', () => {
    component.addNewEmptyLineItem();
    component.removeLineItem(0);
    expect(component.lineItemRemoveButtonDisable).toBeTrue();
  });

  it('should toggle the milestones sidenav', () => {
    component.toggleMilestones();
    expect(component.milestonesTabOpen).toBeTrue();
  });

  it('should reset form when cancel dialog is confirmed', () => {
    spyOn(component, 'resetForm').and.stub();
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    component.onCancel();
    expect(dialog.open).toHaveBeenCalled();
    expect(component.resetForm).toHaveBeenCalled();
  });

  it('should not reset form when cancel dialog is denied', () => {
    spyOn(component, 'resetForm').and.stub();
    spyOn(dialog, 'open').and.returnValue(MOCK_DENY_DIALOG);
    component.onCancel();
    expect(dialog.open).toHaveBeenCalled();
    expect(component.resetForm).not.toHaveBeenCalled();
  });
});
