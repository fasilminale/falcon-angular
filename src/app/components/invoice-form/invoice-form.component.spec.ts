import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InvoiceFormComponent} from './invoice-form.component';
import {of} from 'rxjs';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {WebServices} from '../../services/web-services';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {LoadingService} from '../../services/loading-service';
import {RouterTestingModule} from '@angular/router/testing';
import {FormGroup} from '@angular/forms';
import {UtilService} from '../../services/util-service';
import {InvoiceService} from '../../services/invoice-service';
import {AttachmentService} from '../../services/attachment-service';
import {TemplateService} from '../../services/template-service';
import {Router} from '@angular/router';
import {Template, TemplateToSave} from '../../models/template/template-model';
import {SubscriptionManager} from '../../services/subscription-manager';

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
  let invoiceService: InvoiceService;
  let attachmentService: AttachmentService;
  let templateService: TemplateService;
  let snackBar: MatSnackBar;
  let router: Router;
  let loadingService: LoadingService;
  let dialog: MatDialog;

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
    milestones: [] as Array<any>,
    lineItems: [
      {
        lineItemNetAmount: 2999.99,
        lineItemNumber: '1',
        companyCode: 'test'
      }
    ],
    status: {
      key: 'DELETED',
      label: 'Invoice Deleted'
    }
  };

  const MOCK_CONFIRM_DIALOG = jasmine.createSpyObj({
    afterClosed: of(true),
    close: null
  });
  const MOCK_CANCEL_DIALOG = jasmine.createSpyObj({
    afterClosed: of(false),
    close: null
  });

  const submittedInvoiceResponse = {
    falconInvoiceNumber: 'F0000000002',
    amountOfInvoice: 2999.99,
    attachments: [
      {
        file: {
          name: 'test'
        }
      }
    ],
    milestones: [
      {
        status: 'SUBMITTED',
        user: 'Falcon System'
      }
    ],
    lineItems: [
      {
        lineItemNetAmount: 2999.99
      }
    ],
    status: {
      key: 'SUBMITTED',
      label: 'Submitted for Approval'
    }
  };

  const template: TemplateToSave = {
    name: 'testTemplate',
    description: 'testDescription',
    falconInvoiceNumber: 'F0000000001',
  };

  const templateResponse: Template = {
    name: 'testTemplate',
    description: 'testDescription',
    falconInvoiceNumber: 'F0000000001',
    templateId: '',
    companyCode: '',
    createdBy: '',
    currency: '',
    erpType: '',
    lineItems: [],
    vendorNumber: '',
    workType: '',
    isDisable: true,
    isError: false,
    createdDate: '',
    tempDesc: '',
    tempName: '',
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
        InvoiceService,
        AttachmentService,
        TemplateService,
        UtilService,
        SubscriptionManager
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);
    util = TestBed.inject(UtilService);
    invoiceService = TestBed.inject(InvoiceService);
    attachmentService = TestBed.inject(AttachmentService);
    templateService = TestBed.inject(TemplateService);
    loadingService = TestBed.inject(LoadingService);
    fixture = TestBed.createComponent(InvoiceFormComponent);
    dialog = TestBed.inject(MatDialog);
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
    invoiceResponse.milestones = [];
    spyOn(router, 'navigate').and.returnValue(of(true).toPromise());
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
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(invoiceService, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(attachmentService, 'saveAttachments').and.returnValue(of(true));
    await component.onSaveButtonClick();
    fixture.detectChanges();
    expect(util.openSnackBar)
      .toHaveBeenCalledWith(`Success! Falcon Invoice ${invoiceResponse.falconInvoiceNumber} has been created.`);
  });

  it('should show failure snackbar on failed post', async () => {
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(util, 'openErrorModal').and.returnValue(of());
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(invoiceService, 'saveInvoice').and.returnValue(
      of(new ErrorEvent('test error event'), {
        status: 123,
        statusText: 'test status text'
      })
    );
    await component.onSaveButtonClick();
    fixture.detectChanges();
    expect(util.openErrorModal).toHaveBeenCalledTimes(1);
  });

  it('should show success snackbar on put', async () => {
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(invoiceService, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(attachmentService, 'saveAttachments').and.returnValue(of(true));
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    component.falconInvoiceNumber = 'F0000000010';
    await component.onSaveButtonClick();
    fixture.detectChanges();
    expect(util.openSnackBar)
      .toHaveBeenCalledWith(`Success! Falcon Invoice ${component.falconInvoiceNumber} has been updated.`);
  });

  it('should show failure snackbar on failed put', async () => {
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    spyOn(invoiceService, 'saveInvoice').and.returnValue(of(new ErrorEvent('test error event'), {
      status: 123,
      statusText: 'test status text'
    }));
    component.falconInvoiceNumber = 'F0000000010';
    await component.onSaveButtonClick();
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
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(invoiceService, 'saveInvoice').and.callFake(invoice => {
      requestInvoice = invoice;
      return of(invoiceResponse);
    });
    spyOn(attachmentService, 'saveAttachments').and.returnValue(of(true));
    component.invoiceFormGroup.controls.companyCode.setValue('CODE');
    await component.onSaveButtonClick();
    expect(requestInvoice.lineItems.length).toEqual(1);
    expect(requestInvoice.lineItems[0].companyCode).toEqual('CODE');
  });

  it('should not copy head companyCode to populated line item companyCode', async () => {
    let requestInvoice: any;
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(invoiceService, 'saveInvoice').and.callFake(invoice => {
      requestInvoice = invoice;
      return of(invoiceResponse);
    });
    spyOn(attachmentService, 'saveAttachments').and.returnValue(of(true));
    component.invoiceFormGroup.controls.companyCode.setValue('CODE');
    (component.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
      .controls.companyCode.setValue('CODE');
    await component.onSaveButtonClick();
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

  describe('invalid invoice amounts', () => {
    const falconInvoiceNumbers = ['', 'F0000000010'];

    falconInvoiceNumbers.forEach(value => {
      it('should not create or update an invoice with invalid invoice amounts', () => {
        spyOn(component, 'validateInvoiceAmount').and.callThrough();
        spyOn(component, 'onSaveButtonClick').and.callThrough();
        component.falconInvoiceNumber = value;
        component.validateInvoiceAmount();
        component.onSaveButtonClick();
        expect(component.validateInvoiceAmount).toHaveBeenCalled();
        expect(component.onSaveButtonClick).toHaveBeenCalled();
      });
    });
  });


  it('should display an error indicating a duplicate invoice', async () => {
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    spyOn(component, 'onSaveButtonClick').and.callThrough();
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(true));
    await component.onSaveButtonClick();
    expect(component.validateInvoiceAmount).toHaveBeenCalled();
    expect(component.onSaveButtonClick).toHaveBeenCalled();
  });

  it('should recognized the invoice being edited and not display a duplicate invoice error', async () => {
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    spyOn(component, 'onSaveButtonClick').and.callThrough();
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(true));
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    component.falconInvoiceNumber = 'F0000000010';
    component.amountOfInvoiceFormControl.setValue('0');
    await component.onSaveButtonClick();
    expect(component.validateInvoiceAmount).toHaveBeenCalled();
    expect(component.onSaveButtonClick).toHaveBeenCalled();
  });

  it('should not reset on failed attachments', async () => {
    spyOn(util, 'openErrorModal').and.returnValue(of(true));
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(invoiceService, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(attachmentService, 'saveAttachments').and.returnValue(of(false));
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
    await component.onSaveButtonClick();
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

      describe('when the cancel button is pressed', () => {
        it('should leave page when cancel dialog is CONFIRMED', async () => {
          spyOn(util, 'openConfirmationModal').and.returnValue(of(true));
          await component.onCancel();
          expect(router.navigate).toHaveBeenCalled();
        });
        it('should NOT leave page when cancel dialog is DENIED', async () => {
          spyOn(util, 'openConfirmationModal').and.returnValue(of(false));
          await component.onCancel();
          expect(router.navigate).not.toHaveBeenCalled();
        });
      });
    });

    describe('and the form has NOT been changed', () => {
      beforeEach(() => {
        component.invoiceFormGroup.markAsPristine();
      });

      describe('when the cancel button is pressed', () => {
        it('should leave form', async () => {
          await component.onCancel();
          expect(router.navigate).toHaveBeenCalled();
        });
      });
    });
  });


  it('should reset form when invoice is successfully created', async () => {
    spyOn(component, 'resetForm').and.stub();
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(invoiceService, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(attachmentService, 'saveAttachments').and.returnValue(of(true));
    component.amountOfInvoiceFormControl.setValue('0');
    await component.onSaveButtonClick();
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
    expect(component.totalLineItemNetAmount).toEqual(1);
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
    spyOn(templateService, 'createTemplate').and.returnValue(of(templateResponse));
    await component.saveTemplate();
    fixture.detectChanges();
    expect(util.openSnackBar)
      .toHaveBeenCalledWith(`Success! Template saved as ${templateResponse.name}.`);
  });

  it('should call save template and fail to save', async () => {
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(util, 'openTemplateInputModal').and.returnValue(of(template));
    templateService.createTemplate({} as TemplateToSave);
    spyOn(templateService, 'createTemplate').and.returnValue(of(null));
    await component.saveTemplate();
    fixture.detectChanges();
    expect(util.openSnackBar)
      .toHaveBeenCalledWith('Failure, template was not created.');
  });

  it('should load template', async () => {
    spyOn(loadingService, 'showLoading');
    spyOn(loadingService, 'hideLoading');
    spyOn(templateService, 'getTemplateByName').and.returnValue(of({
      templateId: 'test template id',
      companyCode: 'test company code',
      createdBy: 'test created by',
      currency: 'test currency',
      description: 'test description',
      erpType: 'test erp type',
      falconInvoiceNumber: 'test falcon number',
      lineItems: [{
        companyCode: 'test line item company code',
        costCenter: 'test line item cost center',
        glAccount: 'test line item gl account',
        lineItemNumber: 'test line item number',
      }],
      name: 'test name',
      vendorNumber: 'test vendor number',
      workType: 'test work type',
      isDisable: false,
      isError: false,
      createdDate: 'test created date',
      tempDesc: 'test temp desc',
      tempName: 'test temp name'
    }));
    await component.loadTemplate('test template name');
    expect(loadingService.showLoading).toHaveBeenCalledWith('Loading Template');
    expect(component.invoiceFormGroup.controls.workType.value).toEqual('test work type');
    expect(component.invoiceFormGroup.controls.companyCode.value).toEqual('test company code');
    expect(component.invoiceFormGroup.controls.erpType.value).toEqual('test erp type');
    expect(component.invoiceFormGroup.controls.vendorNumber.value).toEqual('test vendor number');
    expect(component.invoiceFormGroup.controls.currency.value).toEqual('test currency');
    expect(component.lineItemsFormArray.length).toEqual(1);
    const lineItem = component.lineItemsFormArray.at(0) as FormGroup;
    expect(lineItem.controls.glAccount.value).toEqual('test line item gl account');
    expect(lineItem.controls.costCenter.value).toEqual('test line item cost center');
    expect(lineItem.controls.companyCode.value).toEqual('test line item company code');
    expect(lineItem.controls.lineItemNetAmount.value).toEqual(0);
    expect(lineItem.controls.notes.value).toEqual('');
    expect(loadingService.hideLoading).toHaveBeenCalled();
  });

  describe ('submit invoice', () => {
    const falconInvoiceNumbers = ['', 'F0000000010'];

    falconInvoiceNumbers.forEach(value => {
      it('should submit for approval', async () => {
        spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
        spyOn(attachmentService, 'saveAttachments').and.returnValue(of(true));
        spyOn(invoiceService, 'submitForApproval').and.returnValue(of(invoiceResponse));
        spyOn(invoiceService, 'saveInvoice').and.returnValue(of(invoiceResponse));
        spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
        component.falconInvoiceNumber = value;
        await component.onSubmitForApprovalButtonClick();
        expect(attachmentService.saveAttachments).toHaveBeenCalled();
        expect(invoiceService.saveInvoice).toHaveBeenCalled();
        expect(invoiceService.submitForApproval).toHaveBeenCalled();
      });
    });
  });

  it('should NOT submit for approval on failed attachment', async () => {
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(attachmentService, 'saveAttachments').and.returnValue(of(false));
    spyOn(invoiceService, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(invoiceService, 'submitForApproval').and.returnValue(of(invoiceResponse));
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    component.falconInvoiceNumber = 'F0000000010';
    await component.onSubmitForApprovalButtonClick();
    expect(attachmentService.saveAttachments).toHaveBeenCalled();
    expect(invoiceService.saveInvoice).not.toHaveBeenCalled();
    expect(invoiceService.submitForApproval).not.toHaveBeenCalled();
  });

  describe(', after loading data', () => {
    beforeEach(() => {
      spyOn(invoiceService, 'getInvoice').and.returnValue(of(invoiceResponse));
      component.loadData();
    });

    it('should NOT have latest milestone', () => {
      expect(component.hasLatestMilestone).toBeFalse();
      expect(component.latestMilestone).toBeUndefined();
    });

    it('should NOT have latest milestone comments', () => {
      expect(component.hasLatestMilestoneComments).toBeFalse();
      expect(component.latestMilestoneComments).toEqual('');
    });

    it('should have comment label prefix "General"', () => {
      expect(component.commentLabelPrefix).toEqual('General');
    });

    it('should recognize the invoice being edited and not display a duplicate invoice error line item changed', async () => {
      spyOn(component, 'validateInvoiceAmount').and.callThrough();
      spyOn(component, 'onSaveButtonClick').and.callThrough();
      spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(true));
      spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
      component.lineItemsFormArray.controls[0].value.companyCode='TEST2';
      component.falconInvoiceNumber = 'F0000000010';
      component.amountOfInvoiceFormControl.setValue('0');
      await component.onSaveButtonClick();
      expect(component.validateInvoiceAmount).toHaveBeenCalled();
      expect(component.onSaveButtonClick).toHaveBeenCalled();
    });
    it('should failed checkFormArrayCompanyCode and update invoice', async () => {
      spyOn(component, 'validateInvoiceAmount').and.callThrough();
      spyOn(component, 'onSaveButtonClick').and.callThrough();
      spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(true));
      spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
      component.falconInvoiceNumber = 'F0000000010';
      component.amountOfInvoiceFormControl.setValue('0');
      await component.onSaveButtonClick();
      expect(component.validateInvoiceAmount).toHaveBeenCalled();
      expect(component.onSaveButtonClick).toHaveBeenCalled();
    });
    it('should failed checkFormArrayCompanyCode and update invoice', async () => {
      spyOn(component, 'validateInvoiceAmount').and.callThrough();
      spyOn(component, 'onSaveButtonClick').and.callThrough();
      spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(true));
      spyOn(dialog, 'open').and.returnValue(MOCK_CANCEL_DIALOG);
      await component.onSaveButtonClick();
      expect(component.onSaveButtonClick).toHaveBeenCalled();
    });
  
    describe(', given a milestone', () => {
      let testMilestone: any;
      beforeEach(() => {
        testMilestone = {
          name: 'test milestone'
        };
        invoiceResponse.milestones.push(testMilestone);
      });

      it('should have latest milestone', () => {
        expect(component.hasLatestMilestone).toBeTrue();
        expect(component.latestMilestone).toEqual(testMilestone);
      });

      it('should NOT have latest milestone comments', () => {
        expect(component.hasLatestMilestoneComments).toBeFalse();
        expect(component.latestMilestoneComments).toEqual('');
      });

      it('should have comment label prefix "General"', () => {
        expect(component.commentLabelPrefix).toEqual('General');
      });

      describe(', given comments', () => {
        beforeEach(() => {
          testMilestone.comments = 'test comments';
        });

        it('should have latest milestone comments', () => {
          expect(component.hasLatestMilestoneComments).toBeTrue();
          expect(component.latestMilestoneComments).toEqual('test comments');
        });
      });

      describe(', given Submitted status', () => {
        beforeEach(() => {
          testMilestone.status = {key: 'SUBMITTED'};
        });

        it('should have label prefix "Creator"', () => {
          expect(component.commentLabelPrefix).toEqual('Creator');
        });
      });

    });

  });

  describe(', after submitting invoice', () => {
    it('should emit true to the readOnly flag for submitted invoices', () => {
      const getInvoice = spyOn(invoiceService, 'getInvoice').and.returnValue(of(submittedInvoiceResponse));
      const emit = spyOn(component.isSubmittedInvoice, 'emit');
      component.loadData();
      expect(getInvoice).toHaveBeenCalled();
      expect(emit).toHaveBeenCalledWith(true);
    });
  });
});
