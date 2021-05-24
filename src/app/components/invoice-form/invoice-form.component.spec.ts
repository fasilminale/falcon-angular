import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InvoiceFormComponent} from './invoice-form.component';
import {of} from 'rxjs';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {WebServices} from '../../services/web-services';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {LoadingService} from '../../services/loading-service';
import {RouterTestingModule} from '@angular/router/testing';
import {FormGroup} from '@angular/forms';
import {UtilService} from '../../services/util-service';
import {ApiService} from '../../services/api-service';
import {Router} from '@angular/router';

describe('InvoiceFormComponent', () => {

  const companyCode = 'CODE';
  const vendorNumber = '1';
  const externalInvoiceNumber = '1';
  const invoiceDate = new Date(2021, 4, 7);
  const workType = 'Indirect Non-PO Invoice';
  const erpType = 'TPM';
  const glAccount = '1234';
  const costCenter = '2345';
  const currency = 'USD';

  let component: InvoiceFormComponent;
  let fixture: ComponentFixture<InvoiceFormComponent>;
  let util: UtilService;
  let api: ApiService;
  let snackBar: MatSnackBar;
  let router: Router;

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
    ],
    status: {
      key: 'DELETED',
      label: 'Invoice Deleted'
    }
  };

  const template = {
    name: 'testTemplate',
    description: 'testDescription'
  };

  const templateResponse = {
    name: 'testTemplate',
    description: 'testDescription',
    falconInvoiceNumber: 'F0000000001'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        MatDialogModule
      ],
      declarations: [InvoiceFormComponent],
      providers: [
        WebServices,
        MatSnackBar,
        MatDialog,
        LoadingService,
        ApiService,
        UtilService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);
    util = TestBed.inject(UtilService);
    api = TestBed.inject(ApiService);
    fixture = TestBed.createComponent(InvoiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.invoiceFormGroup.controls.companyCode.setValue(companyCode);
    component.invoiceFormGroup.controls.vendorNumber.setValue(vendorNumber);
    component.invoiceFormGroup.controls.externalInvoiceNumber.setValue(externalInvoiceNumber);
    component.invoiceFormGroup.controls.invoiceDate.setValue(invoiceDate);
    component.invoiceFormGroup.controls.amountOfInvoice.setValue('0');
    component.invoiceFormGroup.controls.workType.setValue(workType);
    component.invoiceFormGroup.controls.erpType.setValue(erpType);
    component.invoiceFormGroup.controls.currency.setValue(currency);
    (component.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
      .controls.companyCode.setValue(companyCode);
    (component.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
      .controls.glAccount.setValue(glAccount);
    (component.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
      .controls.costCenter.setValue(costCenter);
    (component.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
      .controls.lineItemNetAmount.setValue('0');
    component.externalAttachment = true;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be enabled editable fields', () => {
    component.readOnly = true;
    fixture.detectChanges();
    component.invoiceFormGroup.controls.workType.disable();
    component.readOnly = false;
    component.ngOnChanges({readOnly: new SimpleChange(null, component.readOnly, true)});
    fixture.detectChanges();
    expect(component.invoiceFormGroup.controls.workType.enabled).toBeTruthy();
  });

  it('should show success snackbar on post', async () => {
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(api, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(api, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(api, 'saveAttachments').and.returnValue(of(true));
    await component.onSubmit();
    fixture.detectChanges();
    expect(util.openSnackBar)
      .toHaveBeenCalledWith(`Success! Falcon Invoice ${invoiceResponse.falconInvoiceNumber} has been created.`);
  });

  it('should show failure snackbar on failed post', async () => {
    spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(util, 'openErrorModal').and.returnValue(of());
    spyOn(api, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(api, 'saveInvoice').and.returnValue(
      of(new ErrorEvent('test error event'), {
        status: 123,
        statusText: 'test status text'
      })
    );
    await component.onSubmit();
    fixture.detectChanges();
    expect(util.openErrorModal).toHaveBeenCalledTimes(1);
  });

  it('should show success snackbar on put', async () => {
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(api, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(api, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(api, 'saveAttachments').and.returnValue(of(true));
    component.falconInvoiceNumber = 'F0000000010';
    await component.onSubmit();
    fixture.detectChanges();
    expect(util.openSnackBar)
      .toHaveBeenCalledWith(`Success! Falcon Invoice ${invoiceResponse.falconInvoiceNumber} has been updated.`);
  });

  it('should show failure snackbar on failed put', async () => {
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(api, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(api, 'saveInvoice').and.returnValue(of(new ErrorEvent('test error event'), {
      status: 123,
      statusText: 'test status text'
    }));
    component.falconInvoiceNumber = 'F0000000010';
    await component.onSubmit();
    fixture.detectChanges();
    expect(util.openSnackBar)
      .toHaveBeenCalledWith('Failure, invoice was not updated!');
  });

  it('should called material snackbar when openSnackBar method called', () => {
    spyOn(snackBar, 'open').and.stub();
    util.openSnackBar('test message');
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('should enable remove button after going up to more than one line item', () => {
    component.addNewEmptyLineItem();
    expect(component.lineItemRemoveButtonDisable).toBeFalse();
  });

  it('should copy head companyCode to line item companyCode', async () => {
    let requestInvoice: any;
    spyOn(api, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(api, 'saveInvoice').and.callFake(invoice => {
      requestInvoice = invoice;
      return of(invoiceResponse);
    });
    spyOn(api, 'saveAttachments').and.returnValue(of(true));
    component.invoiceFormGroup.controls.companyCode.setValue('CODE');
    await component.onSubmit();
    expect(requestInvoice.lineItems.length).toEqual(1);
    expect(requestInvoice.lineItems[0].companyCode).toEqual('CODE');
  });

  it('should not copy head companyCode to populated line item companyCode', async () => {
    let requestInvoice: any;
    spyOn(api, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(api, 'saveInvoice').and.callFake(invoice => {
      requestInvoice = invoice;
      return of(invoiceResponse);
    });
    spyOn(api, 'saveAttachments').and.returnValue(of(true));
    component.invoiceFormGroup.controls.companyCode.setValue('CODE');
    (component.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
      .controls.companyCode.setValue('CODE');
    await component.onSubmit();
    expect(requestInvoice.lineItems.length).toEqual(1);
    expect(requestInvoice.lineItems[0].companyCode).toEqual('CODE');
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
    spyOn(component, 'onInvoiceInvalidated').and.callThrough();
    spyOn(util, 'openErrorModal').and.returnValue(of(false));
    component.onInvoiceInvalidated();
    expect(component.onInvoiceInvalidated).toHaveBeenCalled();
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

  it('should display an error indicating a duplicate invoice', async () => {
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    spyOn(component, 'onSubmit').and.callThrough();
    spyOn(api, 'checkInvoiceIsDuplicate').and.returnValue(of(true));
    await component.onSubmit();
    expect(component.validateInvoiceAmount).toHaveBeenCalled();
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should recognized the invoice being edited and not display a duplicate invoice error', async () => {
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    spyOn(component, 'onSubmit').and.callThrough();
    spyOn(api, 'checkInvoiceIsDuplicate').and.returnValue(of(true));
    component.falconInvoiceNumber = 'F0000000010';
    component.amountOfInvoiceFormControl.setValue('0');
    await component.onSubmit();
    expect(component.validateInvoiceAmount).toHaveBeenCalled();
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should not reset on failed attachments', async () => {
    spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
    spyOn(util, 'openErrorModal').and.returnValue(of(true));
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    spyOn(api, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(api, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(api, 'saveAttachments').and.returnValue(of(false));
    spyOn(component, 'resetForm').and.stub();
    component.falconInvoiceNumber = '';
    const testFile = new File([], 'test file');
    const testType = 'test type';
    component.uploadFormComponent?.attachments?.push({
      file: testFile,
      type: testType,
      uploadError: false,
      action: 'NONE'
    });
    await component.onSubmit();
    expect(component.resetForm).not.toHaveBeenCalled();
  });

  describe('on create page', () => {
    beforeEach(() => {
      component.falconInvoiceNumber = '';
    });

    describe('and the form has been changed', () => {
      beforeEach(() => {
        component.invoiceFormGroup.markAsDirty();
      });

      it('should leave form when cancel dialog is confirmed', async () => {
        spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
        spyOn(util, 'openConfirmationModal').and.returnValue(of('confirm'));
        await component.onCancel();
        expect(router.navigate).toHaveBeenCalled();
      });

      it('should not leave form when cancel dialog is denied', async () => {
        spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
        spyOn(util, 'openConfirmationModal').and.returnValue(of('cancel'));
        await component.onCancel();
        expect(router.navigate).not.toHaveBeenCalled();
      });
    });

  });


  it('should reset form when invoice is successfully created', async () => {
    spyOn(component, 'resetForm').and.stub();
    spyOn(api, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(api, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(api, 'saveAttachments').and.returnValue(of(true));
    component.amountOfInvoiceFormControl.setValue('0');
    await component.onSubmit();
    expect(component.resetForm).toHaveBeenCalled();
  });

  it('should disable line item remove button on form reset', () => {
    component.lineItemRemoveButtonDisable = false;
    component.resetForm();
    expect(component.lineItemRemoveButtonDisable).toBeTrue();
  });

  it('should called changeLineItemNetAmount and totalLineItemNetAmount value changed and validate invoiceDate date', () => {
    (component.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
      .controls.lineItemNetAmount.setValue('1');
    component.calculateLineItemNetAmount();
    expect(component.totallineItemNetAmount).toEqual(1);
    const control = component.invoiceFormGroup.controls.invoiceDate;
    control.setValue('test');
    expect(component.validateDate(control)).toEqual({validateDate: true});
    const date = new Date();
    date.setFullYear(111);
    control.setValue(date);
    expect(component.validateDate(control)).toEqual({validateDate: true});
    date.setFullYear(11111);
    control.setValue(date);
    expect(component.validateDate(control)).toEqual({validateDate: true});
  });

  it('should call save template and confirm save', async () => {
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(util, 'openTemplateInputModal').and.returnValue(of(template));
    spyOn(api, 'createTemplate').and.returnValue(of(templateResponse));
    await component.saveTemplate();
    fixture.detectChanges();
    expect(util.openSnackBar)
      .toHaveBeenCalledWith(`Success! Template saved as ${templateResponse.name}.`);
  });

  it('should call save template and fail to save', async () => {
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(util, 'openTemplateInputModal').and.returnValue(of(template));
    spyOn(api, 'createTemplate').and.returnValue(
      of(new ErrorEvent('test error event'), {
        status: 123,
        statusText: 'test status text'
      })
    );
    await component.saveTemplate();
    fixture.detectChanges();
    expect(util.openSnackBar)
      .toHaveBeenCalledWith('Failure, template was not created.');
  });

});
