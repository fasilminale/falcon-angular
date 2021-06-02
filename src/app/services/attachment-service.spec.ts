import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of, throwError} from 'rxjs';
import {AttachmentService} from './attachment-service';

describe('AttachmentService Tests', () => {
  let attachmentService: AttachmentService;
  let web: WebServices;
  let invoice: any;

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
        AttachmentService,
        WebServices,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    attachmentService = TestBed.inject(AttachmentService);
    web = TestBed.inject(WebServices);
    invoice = {
      falconInvoiceNumber: 'F0000000001',
      companyCode: '1234',
      vendorNumber: '2345',
      externalInvoiceNumber: '3456',
      invoiceDate: new Date()
    };
  });

  it('should create', () => {
    expect(attachmentService).toBeTruthy();
  });

  it('should save attachments', async () => {
    spyOn(web, 'httpPost').and.returnValue(of('ACCEPTED'));
    const successes = await attachmentService.saveAttachments(
      invoice.falconInvoiceNumber, [testAttachment, unmodifiedAttachment]
    ).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(successes).toEqual(true);
  });

  it('should fail unaccepted attachments', async () => {
    spyOn(web, 'httpPost').and.returnValue(of('SOME RESPONSE BODY'));
    const successes = await attachmentService.saveAttachments(
      invoice.falconInvoiceNumber, [testAttachment, unmodifiedAttachment]
    ).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(successes).toEqual(false);
  });

  it('should fail saving attachments', async () => {
    spyOn(web, 'httpPost').and.returnValue(throwError('test error'));
    const successes = await attachmentService.saveAttachments(
      invoice.falconInvoiceNumber, [testAttachment, unmodifiedAttachment]
    ).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(successes).toEqual(false);
  });

  it('should not call attachments route', async () => {
    const successes = await attachmentService.saveAttachments(
      invoice.falconInvoiceNumber, []
    ).toPromise();
    expect(successes).toEqual(true);
  });
})
;
