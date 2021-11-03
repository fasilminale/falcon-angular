import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {of} from 'rxjs';
import {InvoiceService} from './invoice-service';
import {FalconTestingModule} from '../testing/falcon-testing.module';

describe('InvoiceService', () => {

  let invoiceService: InvoiceService;
  let web: WebServices;
  let invoice: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
    web = TestBed.inject(WebServices);
    invoiceService = new InvoiceService(web);
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

  it('should NOT be duplicate on empty', async () => {
    spyOn(web, 'httpPost').and.returnValue(of(''));
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

  it('should extract', async () => {
    spyOn(web, 'httpPut').and.returnValue(of(invoice));
    await invoiceService.extract(invoice.falconInvoiceNumber).toPromise();
    expect(web.httpPut).toHaveBeenCalled();
  });

});
