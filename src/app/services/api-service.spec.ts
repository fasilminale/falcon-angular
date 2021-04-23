import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ApiService} from './api-service';
import {of, throwError} from 'rxjs';

describe('ApiService Tests', () => {
  let api: ApiService;
  let web: WebServices;
  let invoice: any;

  const testAttachment = {
    file: new File([], 'TestFileBlobName'),
    attachmentType: 'TestAttachmentType',
    fileName: 'TestFileName'
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
  });

  it('should create', () => {
    expect(api).toBeTruthy();
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

  // it('should not save empty attachments', async () => {
  //   spyOn(web, 'httpPost').and.returnValue(of('ACCEPTED'));
  //   const successes = await api.saveAllAttachments(invoice.falconInvoiceNumber, []).toPromise();
  //   expect(web.httpPost).not.toHaveBeenCalled();
  //   expect(successes.length).toEqual(0);
  // });
  //
  // it('should save attachments', async () => {
  //   spyOn(web, 'httpPost').and.returnValue(of('ACCEPTED'));
  //   const successes = await api.saveAllAttachments(
  //     invoice.falconInvoiceNumber, [testAttachment]
  //   ).toPromise();
  //   expect(web.httpPost).toHaveBeenCalled();
  //   expect(successes.length).toEqual(1);
  // });
  //
  // it('should fail unaccepted attachments', async () => {
  //   spyOn(web, 'httpPost').and.returnValue(of('SOME RESPONSE BODY'));
  //   const successes = await api.saveAllAttachments(
  //     invoice.falconInvoiceNumber, [testAttachment]
  //   ).toPromise();
  //   expect(web.httpPost).toHaveBeenCalled();
  //   expect(successes.length).toEqual(0);
  // });
  //
  // it('should fail saving attachments', async () => {
  //   spyOn(web, 'httpPost').and.returnValue(throwError('test error'));
  //   const successes = await api.saveAllAttachments(
  //     invoice.falconInvoiceNumber, [testAttachment]
  //   ).toPromise();
  //   expect(web.httpPost).toHaveBeenCalled();
  //   expect(successes.length).toEqual(0);
  // });

})
;
