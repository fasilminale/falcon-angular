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

  const MOCK_CLOSE_ERROR_DIALOG = jasmine.createSpyObj({
    afterClosed: of(false),
    close: null
  });

  const regex = /[a-zA-Z0-9_\\-]/;

  const validNumericValueEvent = {
    keyCode: '048', // The character '0'
    preventDefault: () => {}
  };

  const validAlphabetValueEvent = {
    keyCode: '065', // The character 'A'
    preventDefault: () => {}
  };

  const validUnderscoreEvent = {
    keyCode: '095', // The character '_'
    preventDefault: () => {}
  };

  const validHyphenEvent = {
    keyCode: '095', // The character '_'
    preventDefault: () => {}
  };

  const invalidCharacterEvent = {
    keyCode: 33, // The character '!'
    preventDefault: () => {}
  };

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
    component.amountOfInvoiceFormControl.setValue('0');
    component.onSubmit();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice`)
      .flush(new HttpResponse<never>());
    expect(component.openSnackBar)
      .toHaveBeenCalledWith('Success, invoice created!');
  });

  it('should show failure snackbar on failed post', () => {
    spyOn(component, 'openSnackBar').and.stub();
    component.amountOfInvoiceFormControl.setValue('0');
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
    component.amountOfInvoiceFormControl.setValue('0');
    component.addNewEmptyLineItem();
    expect(component.lineItemRemoveButtonDisable).toBeFalse();
  });

  it('should copy head companyCode to line item companyCode', () => {

    component.invoiceFormGroup.controls.companyCode.setValue('123456');
    component.amountOfInvoiceFormControl.setValue('0');
    component.onSubmit();
    const testRequest = http.expectOne(`${environment.baseServiceUrl}/v1/invoice`);

    expect(testRequest.request.body.lineItems.length).toEqual(1);
    expect(testRequest.request.body.lineItems[0].companyCode).toEqual('123456');
    testRequest.flush(new HttpResponse<never>());

  });

  it('should not copy head companyCode to populated line item companyCode', () => {

    component.invoiceFormGroup.controls.companyCode.setValue('123456');
    component.amountOfInvoiceFormControl.setValue('0');
    // @ts-ignore
    component.invoiceFormGroup.controls.lineItems.get('0').controls.companyCode.setValue('234567');
    component.onSubmit();
    const testRequest = http.expectOne(`${environment.baseServiceUrl}/v1/invoice`);

    expect(testRequest.request.body.lineItems.length).toEqual(1);
    expect(testRequest.request.body.lineItems[0].companyCode).toEqual('234567');
    testRequest.flush(new HttpResponse<never>());

  });

  it('should allow valid alphabet values', () => {
    const result = component.validateRegex(validAlphabetValueEvent);
    expect(result).toBeTrue();
  });

  it('should allow valid numeric values', () => {
    const result = component.validateRegex(validNumericValueEvent);
    expect(result).toBeTrue();
  });

  it('should allow underscore values', () => {
    const result = component.validateRegex(validUnderscoreEvent);
    expect(result).toBeTrue();
  });

  it('should allow hyphen values', () => {
    const result = component.validateRegex(validHyphenEvent);
    expect(result).toBeTrue();
  });

  it('should ignore invalid character values', () => {
    const result = component.validateRegex(invalidCharacterEvent);
    expect(result).toBeFalse();
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

  it('should display an error modal for invalid invoice amounts', () => {
    spyOn(component, 'displayInvalidAmountError').and.callThrough();
    spyOn(dialog, 'open').and.returnValue(MOCK_CLOSE_ERROR_DIALOG);
    component.displayInvalidAmountError();
    expect(dialog.open).toHaveBeenCalled();
    expect(component.displayInvalidAmountError).toHaveBeenCalled();
  });

  it('should validate invoice amounts and return true', () => {
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    component.amountOfInvoiceFormControl.setValue('0');
    component.validateInvoiceAmount();
    expect(component.validateInvoiceAmount).toHaveBeenCalled();
    expect(component.validAmount).toBeTrue();
  });

  it('should validate invoice amounts and return false', () => {
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    component.amountOfInvoiceFormControl.setValue('1');
    component.validateInvoiceAmount();
    expect(component.validateInvoiceAmount).toHaveBeenCalled();
    expect(component.validAmount).toBeFalse();
  });

  it('should not create a new invoice with invalid invoice amounts', () => {
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    spyOn(component, 'onSubmit').and.callThrough();
    component.amountOfInvoiceFormControl.setValue('1');
    component.validateInvoiceAmount();
    component.onSubmit();
    expect(component.validateInvoiceAmount).toHaveBeenCalled();
    expect(component.onSubmit).toHaveBeenCalled();
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
