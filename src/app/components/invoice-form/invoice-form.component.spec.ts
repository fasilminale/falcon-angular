import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InvoiceFormComponent} from './invoice-form.component';
import {of, Subject, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {SimpleChange} from '@angular/core';
import {LoadingService} from '../../services/loading-service';
import {RouterTestingModule} from '@angular/router/testing';
import {FormGroup} from '@angular/forms';
import {UtilService} from '../../services/util-service';
import {InvoiceService} from '../../services/invoice-service';
import {ATTACHMENT_SERVICE, AttachmentService} from '../../services/attachment-service';
import {TemplateService} from '../../services/template-service';
import {Router} from '@angular/router';
import {Template, TemplateToSave} from '../../models/template/template-model';
import {InvoiceFormManager, validateDate} from './invoice-form-manager';
import {UploadFormComponent} from '../upload-form/upload-form.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MasterDataService} from 'src/app/services/master-data-service';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {ToastService} from '@elm/elm-styleguide-ui';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {ManualLineItem} from '../../models/line-item/line-item-model';

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

  const invoiceResponse: InvoiceDataModel = new InvoiceDataModel({
    falconInvoiceNumber: 'F0000000001',
    failedToCreate: false,
    status: {
      key: 'DELETED',
      label: 'Deleted'
    },
    createdBy: 'Test User',
    workType: 'Work Type',
    externalInvoiceNumber: 'ExtInv1',
    invoiceDate: new Date().toISOString(),
    companyCode,
    erpType: 'TPM',
    vendorNumber: '1234',
    amountOfInvoice: '2999.99',
    currency: 'USD',
    lineItems: [
      {
        lineItemNetAmount: 2999.99,
        lineItemNumber: '1',
        companyCode: 'test'
      } as ManualLineItem
    ],
    milestones: [],
    attachments: [],
    comments: 'some comment'
  });

  const MOCK_CONFIRM_DIALOG = jasmine.createSpyObj({
    afterClosed: of(true),
    close: null
  });
  const MOCK_CANCEL_DIALOG = jasmine.createSpyObj({
    afterClosed: of(false),
    close: null
  });

  const submittedInvoiceResponse: InvoiceDataModel = new InvoiceDataModel({
    falconInvoiceNumber: 'F0000000002',
    failedToCreate: false,
    status: {
      key: 'SUBMITTED',
      label: 'Submitted'
    },
    createdBy: 'Test User',
    workType: 'Work Type',
    externalInvoiceNumber: 'ExtInv1',
    invoiceDate: new Date().toISOString(),
    companyCode,
    erpType: 'TPM',
    vendorNumber: '1234',
    amountOfInvoice: '2999.99',
    currency: 'USD',
    lineItems: [
      {
        lineItemNetAmount: 2999.99
      } as ManualLineItem
    ],
    milestones: [{
      timestamp: new Date().toISOString(),
      type: {
        key: 'SUBMITTED',
        label: 'Submitted for Approval'
      },
      user: 'Falcon System'
    }],
    attachments: [],
    comments: 'some comment'
  });

  const createdInvoiceResponse: InvoiceDataModel = new InvoiceDataModel({
    falconInvoiceNumber: 'F0000000002',
    failedToCreate: false,
    status: {
      key: 'CREATED',
      label: 'Created'
    },
    createdBy: 'Test User',
    workType: 'Work Type',
    externalInvoiceNumber: 'ExtInv1',
    invoiceDate: new Date().toISOString(),
    companyCode,
    erpType: 'TPM',
    vendorNumber: '1234',
    amountOfInvoice: '2999.99',
    currency: 'USD',
    lineItems: [
      {
        lineItemNetAmount: 2999.99
      } as ManualLineItem
    ],
    milestones: [{
      timestamp: new Date().toISOString(),
      type: {
        key: 'CREATED',
        label: 'Invoice Created'
      },
      user: 'Falcon System'
    }],
    attachments: [],
    comments: 'some comment'
  });

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

  const templates: Template[] = [
    templateResponse,
    new Template({name: 'test2'})
  ];

  const userInfo = {
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
    login: 'test@test.com',
    role: 'FAL_INTERNAL_WRITE'
  };

  let component: InvoiceFormComponent;
  let fixture: ComponentFixture<InvoiceFormComponent>;
  let util: UtilService;
  let toast: ToastService;
  let invoiceService: InvoiceService;
  let masterDataService: MasterDataService;
  let attachmentService: AttachmentService;
  let templateService: TemplateService;
  let snackBar: MatSnackBar;
  let router: Router;
  let loadingService: LoadingService;
  let dialog: MatDialog;
  let form: InvoiceFormManager;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        RouterTestingModule,
      ],
      declarations: [
        InvoiceFormComponent,
        UploadFormComponent
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);
    util = TestBed.inject(UtilService);
    toast = TestBed.inject(ToastService);
    spyOn(toast, 'openSuccessToast').and.stub();
    spyOn(toast, 'openErrorToast').and.stub();
    invoiceService = TestBed.inject(InvoiceService);
    masterDataService = TestBed.inject(MasterDataService);
    attachmentService = TestBed.inject(ATTACHMENT_SERVICE);
    templateService = TestBed.inject(TemplateService);
    loadingService = TestBed.inject(LoadingService);
    fixture = TestBed.createComponent(InvoiceFormComponent);
    dialog = TestBed.inject(MatDialog);
    form = TestBed.inject(InvoiceFormManager);
    spyOn(form, 'establishTouchLink').and.stub();
    spyOn(form, 'forceValueChangeEvent').and.stub();

    component = fixture.componentInstance;
    component.userInfo = new UserInfoModel(userInfo);
    fixture.detectChanges();
    component.form.companyCode.setValue(companyCode);
    component.form.vendorNumber.setValue(vendorNumber);
    component.form.externalInvoiceNumber.setValue(externalInvoiceNumber);
    component.form.invoiceDate.setValue(invoiceDate);
    component.form.amountOfInvoice.setValue('1');
    component.form.workType.setValue(workType);
    component.form.erpType.setValue(erpType);
    component.form.currency.setValue(currency);
    (component.form.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
      .controls.companyCode.setValue(companyCode);
    (component.form.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
      .controls.glAccount.setValue(glAccount);
    (component.form.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
      .controls.costCenter.setValue(costCenter);
    (component.form.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
      .controls.lineItemNetAmount.setValue('1');
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
    spyOn(masterDataService, 'checkCompanyCode').and.returnValue(of('TEST'));
    component.form.invoiceFormGroup.controls.workType.disable();
    component.readOnly = false;
    component.ngOnChanges({readOnly: new SimpleChange(null, component.readOnly, true)});
    fixture.detectChanges();
    expect(component.form.invoiceFormGroup.controls.workType.enabled).toBeTruthy();
    const element: HTMLElement = fixture.nativeElement;
    const inputElement: HTMLInputElement | null = element.querySelector('#company-code-input');
    inputElement?.focus();
    fixture.componentInstance.form.companyCode.setValue('test');
    inputElement?.focus();
    fixture.detectChanges();
  });

  it('should show success snackbar on post', async () => {
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(invoiceService, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(attachmentService, 'saveAttachments').and.returnValue(of(true));
    await component.onSaveButtonClick();
    fixture.detectChanges();
    expect(toast.openSuccessToast).toHaveBeenCalledWith(
      `Success! Falcon Invoice ${invoiceResponse.falconInvoiceNumber} has been created.`
    );
  });

  it('should show failure snackbar on failed post', async () => {
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
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(invoiceService, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(attachmentService, 'saveAttachments').and.returnValue(of(true));
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    component.falconInvoiceNumber = 'F0000000010';
    await component.onSaveButtonClick();
    fixture.detectChanges();
    expect(toast.openSuccessToast).toHaveBeenCalledWith(
      `Success! Falcon Invoice ${component.falconInvoiceNumber} has been updated.`
    );
  });

  it('should show failure snackbar on failed put', async () => {
    spyOn(attachmentService, 'saveAttachments').and.returnValue(of(true));
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    spyOn(invoiceService, 'saveInvoice').and.returnValue(of(new ErrorEvent('test error event'), {
      status: 123,
      statusText: 'test status text'
    }));
    component.falconInvoiceNumber = 'F0000000010';
    await component.onSaveButtonClick();
    fixture.detectChanges();
    expect(toast.openErrorToast).toHaveBeenCalledWith(
      'Failure, invoice was not updated!'
    );
  });

  it('should enable remove button after going up to more than one line item', () => {
    component.form.addNewEmptyLineItem();
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
    component.form.invoiceFormGroup.controls.companyCode.setValue('CODE');
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
    component.form.invoiceFormGroup.controls.companyCode.setValue('CODE');
    fixture.detectChanges();
    (component.form.invoiceFormGroup.controls.lineItems.get('0') as FormGroup)
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
    component.form.addNewEmptyLineItem();
    component.form.removeLineItem(0);
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
    component.form.amountOfInvoice.setValue('1');
    component.validateInvoiceAmount();
    expect(component.validateInvoiceAmount).toHaveBeenCalled();
    expect(component.validAmount).toBeTrue();
  });

  it('should validate invoice amounts and return false', () => {
    spyOn(component, 'validateInvoiceAmount').and.callThrough();
    component.form.amountOfInvoice.setValue('2');
    component.validateInvoiceAmount();
    expect(component.validateInvoiceAmount).toHaveBeenCalled();
    expect(component.validAmount).toBeFalse();
  });

  describe('invalid invoice amounts', () => {
    const falconInvoiceNumbers = ['', 'F0000000010'];

    falconInvoiceNumbers.forEach(value => {
      it('should not create or update an invoice with invalid invoice amounts FIN="' + value + '"', async () => {
        spyOn(util, 'openErrorModal').and.returnValue(of(true));
        spyOn(util, 'openConfirmationModal').and.returnValue(of(true));
        spyOn(component, 'validateInvoiceAmount').and.returnValue(false);
        spyOn(component, 'gotoInvoiceList').and.stub();
        component.falconInvoiceNumber = value;
        component.validateInvoiceAmount();
        await component.onSaveButtonClick();
        expect(component.validateInvoiceAmount).toHaveBeenCalled();
        expect(component.gotoInvoiceList).not.toHaveBeenCalled();
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
    component.form.amountOfInvoice.setValue('0');
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

  it('should reset form when invoice is successfully created', async () => {
    spyOn(component, 'resetForm').and.stub();
    spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(false));
    spyOn(invoiceService, 'saveInvoice').and.returnValue(of(invoiceResponse));
    spyOn(attachmentService, 'saveAttachments').and.returnValue(of(true));
    spyOn(component, 'gotoInvoiceList').and.stub();
    component.form.amountOfInvoice.setValue('1');
    await component.onSaveButtonClick();
    expect(component.gotoInvoiceList).toHaveBeenCalled();
    expect(component.resetForm).toHaveBeenCalled();
  });

  it('should disable line item remove button on form reset', () => {
    spyOn(templateService, 'getTemplates').and.returnValue(of(templates));
    component.lineItemRemoveButtonDisable = false;
    component.resetForm();
    expect(component.lineItemRemoveButtonDisable).toBeTrue();
  });

  it('should called changeLineItemNetAmount and totalLineItemNetAmount value changed and validate invoiceDate date', () => {
    (component.form.lineItems.get('0') as FormGroup)
      .controls.lineItemNetAmount.setValue('1');
    component.form.calculateLineItemNetAmount();
    expect(component.form.totalLineItemNetAmount).toEqual(1);
    const control = component.form.invoiceDate;
    control.setValue('test');
    expect(validateDate(control)).toEqual({validateDate: true});
    const date = new Date();
    date.setFullYear(111);
    control.setValue(date);
    expect(validateDate(control)).toEqual({validateDate: true});
    date.setFullYear(11111);
    control.setValue(date);
    expect(validateDate(control)).toEqual({validateDate: true});
  });

  it('should call save template and confirm save', async () => {
    spyOn(util, 'openTemplateInputModal').and.returnValue(of(template));
    spyOn(templateService, 'createTemplate').and.returnValue(of(templateResponse));
    await component.saveTemplate();
    fixture.detectChanges();
    expect(toast.openSuccessToast).toHaveBeenCalledWith(
      `Success! Template saved as ${templateResponse.name}.`
    );
  });

  it('should call save template and fail to save', async () => {
    spyOn(util, 'openTemplateInputModal').and.returnValue(of(template));
    templateService.createTemplate({} as TemplateToSave);
    spyOn(templateService, 'createTemplate').and.returnValue(of(null));
    await component.saveTemplate();
    fixture.detectChanges();
    expect(toast.openErrorToast).toHaveBeenCalledWith(
      'Failure, template was not created.'
    );
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
    expect(component.form.workType.value).toEqual('test work type');
    expect(component.form.companyCode.value).toEqual('TEST COMPANY CODE');
    expect(component.form.erpType.value).toEqual('test erp type');
    expect(component.form.vendorNumber.value).toEqual('TEST VENDOR NUMBER');
    expect(component.form.currency.value).toEqual('test currency');
    expect(component.form.lineItems.length).toEqual(1);
    const lineItem = component.form.lineItemGroup(0);
    expect(lineItem.controls.glAccount.value).toEqual('TEST LINE ITEM GL ACCOUNT');
    expect(lineItem.controls.costCenter.value).toEqual('TEST LINE ITEM COST CENTER');
    expect(lineItem.controls.companyCode.value).toEqual('TEST LINE ITEM COMPANY CODE');
    expect(lineItem.controls.lineItemNetAmount.value).toEqual('0');
    expect(lineItem.controls.notes.value).toEqual(null);
    expect(loadingService.hideLoading).toHaveBeenCalled();
  });

  describe('submit invoice', () => {
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
      spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(true));
      spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
      component.form.lineItemGroup(0).controls.companyCode.setValue('TEST2');
      component.falconInvoiceNumber = 'F0000000010';
      component.form.amountOfInvoice.setValue('0');
      await component.onSaveButtonClick();
      expect(component.validateInvoiceAmount).toHaveBeenCalled();
    });

    it('should failed checkFormArrayCompanyCode and update invoice', async () => {
      spyOn(component, 'validateInvoiceAmount').and.callThrough();
      spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(true));
      spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
      component.falconInvoiceNumber = 'F0000000010';
      component.form.amountOfInvoice.setValue('0');
      await component.onSaveButtonClick();
      expect(component.validateInvoiceAmount).toHaveBeenCalled();
    });

    it('should failed checkFormArrayCompanyCode and update invoice', async () => {
      spyOn(component, 'validateInvoiceAmount').and.callThrough();
      spyOn(invoiceService, 'checkInvoiceIsDuplicate').and.returnValue(of(true));
      spyOn(dialog, 'open').and.returnValue(MOCK_CANCEL_DIALOG);
      await component.onSaveButtonClick();
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
          testMilestone.type = {key: 'SUBMITTED'};
        });

        it('should have label prefix "Creator"', () => {
          expect(component.commentLabelPrefix).toEqual('Creator');
        });
      });

      describe(', given Rejected status', () => {
        beforeEach(() => {
          testMilestone.type = {key: 'REJECTED'};
        });

        it('should have label prefix "Creator"', () => {
          expect(component.commentLabelPrefix).toEqual('Rejection');
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

    it('should not emit to the readOnly flag for submitted invoices', () => {
      const getInvoice = spyOn(invoiceService, 'getInvoice').and.returnValue(of(createdInvoiceResponse));
      const emit = spyOn(component.isSubmittedInvoice, 'emit');
      component.loadData();
      expect(getInvoice).toHaveBeenCalled();
      expect(emit).not.toHaveBeenCalled();
    });
  });

  it('should set uploadFromComponent dirty', () => {
    const childFixture = TestBed.createComponent(UploadFormComponent);
    component.focusInvoiceDate();
    component.uploadFormComponent = childFixture.componentInstance;
    component.focusInvoiceDate();
    const isDirty = component.uploadFormComponent?.formGroup.dirty;
    expect(isDirty).toBeTruthy();
  });

  it('should set uploadFromComponent dirty when focused on lineItem element', () => {
    const childFixture = TestBed.createComponent(UploadFormComponent);
    component.focusInvoiceDate();
    component.uploadFormComponent = childFixture.componentInstance;
    component.focusLineItemElement(component.form.lineItems.controls[0]);
    const isDirty = component.uploadFormComponent?.formGroup.dirty;
    expect(isDirty).toBeTruthy();
  });

  it('should set uploadFromComponent dirty when focused on amountOfInvoice', () => {
    const childFixture = TestBed.createComponent(UploadFormComponent);
    component.focusInvoiceDate();
    component.uploadFormComponent = childFixture.componentInstance;
    component.focusAmountOfInvoice();
    const isDirty = component.uploadFormComponent?.formGroup.dirty;
    expect(isDirty).toBeTruthy();
  });


  it('should test if companyCode exists', () => {
    spyOn(masterDataService, 'checkCompanyCode').and.returnValue(throwError('service failed'));
    component.form.invoiceFormGroup.controls.companyCode.setValue('CODE');
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const inputElemnt: HTMLInputElement | null = element.querySelector('#company-code-input');
    inputElemnt?.focus();
    fixture.componentInstance.form.companyCode.setValue('test');
    inputElemnt?.focus();
    fixture.detectChanges();
    expect(component.form.invoiceFormGroup.controls.companyCode.hasError('validateCompanyCode')).toBeTruthy();

    inputElemnt?.focus();
    fixture.componentInstance.form.companyCode.setValue(null);
    component.form.invoiceFormGroup.controls.companyCode.setValue(null);
    fixture.detectChanges();
    inputElemnt?.blur();
    fixture.detectChanges();
    expect(component.form.invoiceFormGroup.controls.companyCode.hasError('validateCompanyCode')).toBeFalsy();
  });

  it('onCancel subscription', done => {
    const onCancel$ = new Subject<any>();
    component.onCancel$ = onCancel$.asObservable();

    onCancel$.subscribe(() => {
      done();
    });

    // Run Test
    onCancel$.next(true);
  });
});
