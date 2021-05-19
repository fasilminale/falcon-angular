import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ApiService} from './api-service';
import {of, throwError} from 'rxjs';
import { Template } from '../models/template/template-model';

describe('ApiService Tests', () => {
  let api: ApiService;
  let web: WebServices;
  let invoice: any;
  let template: any;
  let manageTemplate: Template;

  const testAttachment = {
    file: new File([], 'TestFileBlobName'),
    attachmentType: 'TestAttachmentType',
    fileName: 'TestFileName'
  };

  const unmodifiedAttachment = {
    file: new File([], 'TestFileBlobName'),
    attachmentType: 'TestAttachmentType',
    fileName: 'TestFileName',
    action: 'NONE'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        ApiService,
        WebServices,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    api = TestBed.inject(ApiService);
    web = TestBed.inject(WebServices);
    invoice = {
      falconInvoiceNumber: 'F0000000001',
      companyCode: '1234',
      vendorNumber: '2345',
      externalInvoiceNumber: '3456',
      invoiceDate: new Date()
    };

    template = {
      name: 'testTemplate',
      description: 'testDescription'
    };
    manageTemplate = new Template({
      templateId: '1',
      description: '',
      name: 'test',
      isDisable: true,
      createdDate: '',
      lineItems: [
        {
          companyCode: '',
          costCenter: '',
          glAccount: '',
          lineItemNumber: '',
        }
      ]
    });
  });

  it('should create', () => {
    expect(api).toBeTruthy();
  });

  it('template should be duplicate from matching template name', async () => {
    spyOn(web, 'httpGet').and.returnValue(of(template));
    const isDuplicate = await api.checkTemplateIsDuplicate(template.name).toPromise();
    expect(web.httpGet).toHaveBeenCalled();
    expect(isDuplicate).toBeTrue();
  });

  it('template should NOT be duplicate from non-matching template name', async () => {
    spyOn(web, 'httpGet').and.returnValue(throwError('test error'));
    const isDuplicate = await api.checkTemplateIsDuplicate("some other name").toPromise();
    expect(web.httpGet).toHaveBeenCalled();
    expect(isDuplicate).toBeFalse();
  });

  it('should NOT be duplicate from matching falconInvoiceNumber', async () => {
    spyOn(web, 'httpPost').and.returnValue(of(invoice));
    const isDuplicate = await api.checkInvoiceIsDuplicate(invoice).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(isDuplicate).toBeFalse();
  });

  it('should be duplicate if missing falconInvoiceNumber', async () => {
    invoice.falconInvoiceNumber = undefined;
    spyOn(web, 'httpPost').and.returnValue(of(invoice));
    const isDuplicate = await api.checkInvoiceIsDuplicate(invoice).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(isDuplicate).toBeTrue();
  });

  it('should NOT be duplicate on error', async () => {
    spyOn(web, 'httpPost').and.returnValue(throwError('test error'));
    const isDuplicate = await api.checkInvoiceIsDuplicate(invoice).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(isDuplicate).toBeFalse();
  });

  it('should update if has falconInvoiceNumber', async () => {
    spyOn(web, 'httpPut').and.returnValue(of(invoice));
    await api.saveInvoice(invoice).toPromise();
    expect(web.httpPut).toHaveBeenCalled();
  });

  it('should create if missing falconInvoiceNumber', async () => {
    invoice.falconInvoiceNumber = undefined;
    spyOn(web, 'httpPost').and.returnValue(of(invoice));
    await api.saveInvoice(invoice).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
  });

  it('should save attachments', async () => {
    spyOn(web, 'httpPost').and.returnValue(of('ACCEPTED'));
    const successes = await api.saveAttachments(
      invoice.falconInvoiceNumber, [testAttachment, unmodifiedAttachment]
    ).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(successes).toEqual(true);
  });

  it('should fail unaccepted attachments', async () => {
    spyOn(web, 'httpPost').and.returnValue(of('SOME RESPONSE BODY'));
    const successes = await api.saveAttachments(
      invoice.falconInvoiceNumber, [testAttachment, unmodifiedAttachment]
    ).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(successes).toEqual(false);
  });

  it('should fail saving attachments', async () => {
    spyOn(web, 'httpPost').and.returnValue(throwError('test error'));
    const successes = await api.saveAttachments(
      invoice.falconInvoiceNumber, [testAttachment, unmodifiedAttachment]
    ).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(successes).toEqual(false);
  });

  it('should not call attachments route', async () => {
    const successes = await api.saveAttachments(
      invoice.falconInvoiceNumber, []
    ).toPromise();
    expect(successes).toEqual(true);
  });


  it('should create template', async () => {
    spyOn(web, 'httpPost').and.returnValue(of('SOME RESPONSE BODY'));
    const successes = await api.createTemplate(manageTemplate).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
  });

  it('should update template', async () => {
    spyOn(web, 'httpPut').and.returnValue(of('SOME RESPONSE BODY'));
    const successes = await api.updateTemplate(parseInt(manageTemplate.templateId), manageTemplate).toPromise();
    expect(web.httpPut).toHaveBeenCalled();
  });
})
;
