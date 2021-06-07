import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of, throwError} from 'rxjs';
import {InvoiceService} from './invoice-service';

describe('InvoiceService Tests', () => {
  let invoiceService: InvoiceService;
  let web: WebServices;
  let invoice: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        InvoiceService,
        WebServices,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    invoiceService = TestBed.inject(InvoiceService);
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
    expect(invoiceService).toBeTruthy();
  });

  it('should NOT be duplicate from matching falconInvoiceNumber', async () => {
    spyOn(web, 'httpPost').and.returnValue(of(invoice));
    const isDuplicate = await invoiceService.checkInvoiceIsDuplicate(invoice).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(isDuplicate).toBeFalse();
  });

  it('should be duplicate if missing falconInvoiceNumber', async () => {
    invoice.falconInvoiceNumber = undefined;
    spyOn(web, 'httpPost').and.returnValue(of(invoice));
    const isDuplicate = await invoiceService.checkInvoiceIsDuplicate(invoice).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(isDuplicate).toBeTrue();
  });

  it('should NOT be duplicate on error', async () => {
    spyOn(web, 'httpPost').and.returnValue(throwError('test error'));
    const isDuplicate = await invoiceService.checkInvoiceIsDuplicate(invoice).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(isDuplicate).toBeFalse();
  });

  it('should update if has falconInvoiceNumber', async () => {
    spyOn(web, 'httpPut').and.returnValue(of(invoice));
    await invoiceService.saveInvoice(invoice).toPromise();
    expect(web.httpPut).toHaveBeenCalled();
  });

  it('should create if missing falconInvoiceNumber', async () => {
    invoice.falconInvoiceNumber = undefined;
    spyOn(web, 'httpPost').and.returnValue(of(invoice));
    await invoiceService.saveInvoice(invoice).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
  });

  it('should submit for approval', async () => {
    spyOn(web, 'httpPost').and.returnValue(of(invoice));
    const result = await invoiceService.submitForApproval(invoice.falconInvoiceNumber).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(result).toEqual(invoice);
  });

});
