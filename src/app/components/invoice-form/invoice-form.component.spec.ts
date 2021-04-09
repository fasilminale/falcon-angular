import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';

import {InvoiceFormComponent} from './invoice-form.component';
import {of} from 'rxjs';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {WebServices} from '../../services/web-services';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpResponse} from '@angular/common/http';
import {LoadingService} from '../../services/loading-service';
import {RouterTestingModule} from '@angular/router/testing';

describe('InvoiceFormComponent', () => {
  let component: InvoiceFormComponent;
  let fixture: ComponentFixture<InvoiceFormComponent>;

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

  const companyCode = 'CODE';
  const vendorNumber = '1';
  const externalInvoiceNumber = '1';
  const invoiceDate = new Date(2021, 4, 7);
  const isValidUrl = `${environment.baseServiceUrl}/v1/invoice/is-valid`;
  const invoiceNumber = '1';

  const validNumericValueEvent = {
    keyCode: '048', // The character '0'
    preventDefault: () => {
    }
  };

  const validAlphabetValueEvent = {
    keyCode: '065', // The character 'A'
    preventDefault: () => {
    }
  };

  const validUnderscoreEvent = {
    keyCode: '095', // The character '_'
    preventDefault: () => {
    }
  };

  const validHyphenEvent = {
    keyCode: '095', // The character '_'
    preventDefault: () => {
    }
  };

  const validSpaceEvent = {
    keyCode: '032', // The space character ' '
    preventDefault: () => {
    }
  };

  const invalidCharacterEvent = {
    keyCode: 33, // The character '!'
    preventDefault: () => {
    }
  };

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
    milestones: [],
    lineItems: [
      {
        lineItemNetAmount: 2999.99
      }
    ]
  };

  let http: HttpTestingController;
  let snackBar: MatSnackBar;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, NoopAnimationsModule, MatDialogModule],
      declarations: [InvoiceFormComponent],
      providers: [WebServices, MatSnackBar, MatDialog, LoadingService, MatSnackBar],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(InvoiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.companyCode.setValue(companyCode);
    component.vendorNumber.setValue(vendorNumber);
    component.externalInvoiceNumber.setValue(externalInvoiceNumber);
    component.invoiceDate.setValue(invoiceDate);
    spyOn(component, 'getInvoiceId').and.callFake(() => {
    });
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be enabled editable fields', fakeAsync(() => {
    component.readOnly = true;
    fixture.detectChanges();
    component.invoiceFormGroup.controls.workType.disable();
    component.readOnly = false;
    component.ngOnChanges({readOnly: new SimpleChange(null, component.readOnly, true)});
    fixture.detectChanges();
    expect(component.invoiceFormGroup.controls.workType.enabled).toBeTruthy();
  }));

  it('should show success snackbar on post', fakeAsync(() => {
    spyOn(component, 'openSnackBar').and.stub();
    component.amountOfInvoiceFormControl.setValue('0');
    component.onSubmit();
    http.expectOne(isValidUrl)
      .error(new ErrorEvent('Invoice Not Found'));
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice`)
      .flush(invoiceResponse);
    fixture.detectChanges();
    expect(component.openSnackBar)
      .toHaveBeenCalledWith(`Success! Falcon Invoice ${invoiceResponse.falconInvoiceNumber} has been created.`);
  }));

  it('should show failure snackbar on failed post', () => {
    spyOn(component, 'openSnackBar').and.stub();
    component.amountOfInvoiceFormControl.setValue('0');
    component.onSubmit();
    http.expectOne(isValidUrl)
      .error(new ErrorEvent('Invoice Not Found'));
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice`)
      .error(new ErrorEvent('test error event'), {
        status: 123,
        statusText: 'test status text'
      });
    expect(component.openSnackBar)
      .toHaveBeenCalledWith('Failure, invoice was not created!');
  });

  it('should show success snackbar on put', fakeAsync(() => {
    spyOn(component, 'openSnackBar').and.stub();
    component.amountOfInvoiceFormControl.setValue('0');
    component.falconInvoiceNumber = 'F0000000010';
    component.onSubmit();
    http.expectOne(isValidUrl)
      .error(new ErrorEvent('Invoice Not Found'));
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${component.falconInvoiceNumber}`)
      .flush(invoiceResponse);
    fixture.detectChanges();
    expect(component.openSnackBar)
      .toHaveBeenCalledWith(`Success! Falcon Invoice ${invoiceResponse.falconInvoiceNumber} has been updated.`);
  }));

  it('should show failure snackbar on failed put', () => {
    spyOn(component, 'openSnackBar').and.stub();
    component.amountOfInvoiceFormControl.setValue('0');
    component.falconInvoiceNumber = 'F0000000010';
    component.onSubmit();
    http.expectOne(isValidUrl)
      .error(new ErrorEvent('Invoice Not Found'));
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/${component.falconInvoiceNumber}`)
      .error(new ErrorEvent('test error event'), {
        status: 123,
        statusText: 'test status text'
      });
    expect(component.openSnackBar)
      .toHaveBeenCalledWith('Failure, invoice was not updated!');
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

    component.invoiceFormGroup.controls.companyCode.setValue('CODE');
    component.amountOfInvoiceFormControl.setValue('0');
    component.onSubmit();
    http.expectOne(isValidUrl)
      .error(new ErrorEvent('Invoice Not Found'));
    const testRequest = http.expectOne(`${environment.baseServiceUrl}/v1/invoice`);

    expect(testRequest.request.body.lineItems.length).toEqual(1);
    expect(testRequest.request.body.lineItems[0].companyCode).toEqual('CODE');
    testRequest.flush(new HttpResponse<never>());

  });

  it('should not copy head companyCode to populated line item companyCode', () => {

    component.invoiceFormGroup.controls.companyCode.setValue('CODE');
    component.amountOfInvoiceFormControl.setValue('0');
    // @ts-ignore
    component.invoiceFormGroup.controls.lineItems.get('0').controls.companyCode.setValue('CODE');
    component.onSubmit();
    http.expectOne(isValidUrl)
      .error(new ErrorEvent('Invoice Not Found'));
    const testRequest = http.expectOne(`${environment.baseServiceUrl}/v1/invoice`);

    expect(testRequest.request.body.lineItems.length).toEqual(1);
    expect(testRequest.request.body.lineItems[0].companyCode).toEqual('CODE');
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

  it('should allow spaces in the free text regex', () => {
    const result = component.validateFreeTextRegex(validSpaceEvent);
    expect(result).toBeTrue();
  });

  it('should ignore invalid character values in the free text regex', () => {
    const result = component.validateFreeTextRegex(invalidCharacterEvent);
    expect(result).toBeFalse();
  });

  it('should disable remove button after going down to one line item', () => {
    component.addNewEmptyLineItem();
    component.removeLineItem(0);
    expect(component.lineItemRemoveButtonDisable).toBeTrue();
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

  it('should display an error indicating a duplicate invoice', () => {
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    spyOn(component, 'onSubmit').and.callThrough();
    component.falconInvoiceNumber = 'F0000000010';
    component.amountOfInvoiceFormControl.setValue('0');
    component.onSubmit();
    http.expectOne(isValidUrl)
      .flush(new HttpResponse<never>());
    expect(component.validateInvoiceAmount).toHaveBeenCalled();
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should recognized the invoice being edited and not display a duplicate invoice error', () => {
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    spyOn(component, 'onSubmit').and.callThrough();
    component.falconInvoiceNumber = 'F0000000010';
    component.amountOfInvoiceFormControl.setValue('0');
    component.onSubmit();
    http.expectOne(isValidUrl)
      .flush({falconInvoiceNumber: 'F0000000010'});
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

  it('should reset form when invoice is successfully created', () => {
    spyOn(component, 'resetForm').and.stub();
    component.amountOfInvoiceFormControl.setValue('0');
    component.onSubmit();
    http.expectOne(isValidUrl)
      .error(new ErrorEvent('Invoice Not Found'));
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice`)
      .flush(new HttpResponse<never>());
    expect(component.resetForm).toHaveBeenCalled();
  });

  it('should add attachment', () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    component.attachmentFormGroup.controls.file.setValue(testFile);
    component.attachmentFormGroup.controls.attachmentType.setValue(testType);
    component.addAttachment();
    expect(component.attachments).toEqual([{file: testFile, type: testType, uploadError: false}]);
  });

  it('should reset form controls on attachment add', () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    component.attachmentFormGroup.controls.file.setValue(testFile);
    component.attachmentFormGroup.controls.attachmentType.setValue(testType);
    component.addAttachment();
    expect(component.attachmentFormGroup.controls.file.value).toBeFalsy();
    expect(component.attachmentFormGroup.controls.attachmentType.value).toBeFalsy();
  });

  it('should submit with attachments', () => {
    spyOn(component, 'validateInvoiceAmount').and.callFake(() => {
    });
    spyOn(component, 'addAttachment').and.callThrough();
    spyOn(component, 'onSubmit').and.callThrough();
    component.amountOfInvoiceFormControl.setValue('1');
    const testFile = new File([], 'test file');
    const testType = 'test type';
    component.attachmentFormGroup.controls.file.setValue(testFile);
    component.attachmentFormGroup.controls.attachmentType.setValue(testType);
    component.addAttachment();
    component.onSubmit();
    http.expectOne(isValidUrl)
      .error(new ErrorEvent('Invoice Not Found'));
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice`)
      .flush(invoiceResponse);
    fixture.detectChanges();
    http.expectOne(`${environment.baseServiceUrl}/v1/attachment/${invoiceResponse.falconInvoiceNumber}`)
      .flush(invoiceResponse);
    fixture.detectChanges();
    expect(component.addAttachment).toHaveBeenCalled();
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should remove attachment', () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    component.attachmentFormGroup.controls.file.setValue(testFile);
    component.attachmentFormGroup.controls.attachmentType.setValue(testType);
    component.addAttachment();
    component.removeAttachment(0);
    expect(component.attachments).toEqual([]);
  });

  it('should not remove attachment', () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    spyOn(dialog, 'open').and.returnValue(MOCK_DENY_DIALOG);
    component.attachmentFormGroup.controls.file.setValue(testFile);
    component.attachmentFormGroup.controls.attachmentType.setValue(testType);
    component.addAttachment();
    component.removeAttachment(0);
    expect(component.attachments).toHaveSize(1);
  });

  it('should disable line item remove button on form reset', () => {
    component.lineItemRemoveButtonDisable = false;
    component.resetForm();
    expect(component.lineItemRemoveButtonDisable).toBeTrue();
  });

});
