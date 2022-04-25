import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {of, Subscription, throwError} from 'rxjs';
import {InvoiceService} from './invoice-service';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {EditAutoInvoiceModel} from "../models/invoice/edit-auto-invoice.model";
import {environment} from "../../environments/environment";

describe('InvoiceService', () => {

  let invoiceService: InvoiceService;
  let web: WebServices;
  let invoice: any;
  let subscription: Subscription;

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
    subscription = new Subscription();
  });

  afterEach(() => {
    subscription.unsubscribe();
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

  it('should get invoice details', async () => {
    const freightOrders = await invoiceService.getFreightOrderDetails().toPromise();
    expect(freightOrders.length).toBe(1);

  });

  it('should return Observable when updateAutoInvoice invoked', (done) => {
     const body: EditAutoInvoiceModel = {}
     const falconInvoiceNumber = 'F0000001234'
     const env = environment;
     env.baseServiceUrl = 'https://somedomain.com';
     spyOn(web, 'httpPut').and.returnValue(of(invoice));
     subscription.add(invoiceService.updateAutoInvoice(body, falconInvoiceNumber).subscribe(
       (result) => {
         expect(result).toEqual(invoice);
         expect(web.httpPut).toHaveBeenCalledOnceWith(`${env.baseServiceUrl}/v1/invoice/auto/${falconInvoiceNumber}`, body);
         done();
       },
       () => fail(`Subscription should have succeeded`)
     ))
  });

  it('should return error when updateAutoInvoice invoked and fails', (done) => {
    const body: EditAutoInvoiceModel = {}
    const falconInvoiceNumber = 'F0000001234'
    const env = environment;
    env.baseServiceUrl = 'https://somedomain.com';
    spyOn(web, 'httpPut').and.returnValue(throwError(new Error('Bad')));
    subscription.add(invoiceService.updateAutoInvoice(body, falconInvoiceNumber).subscribe(
      (result) => {
        fail(`Subscription should have failed`);
      },
      (error: Error) => {
        expect(error.message).toEqual('Bad');
        expect(web.httpPut).toHaveBeenCalledOnceWith(`${env.baseServiceUrl}/v1/invoice/auto/${falconInvoiceNumber}`, body);
        done();
      }
    ))
  });

});
