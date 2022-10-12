import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {of, Subscription, throwError} from 'rxjs';
import {InvoiceService} from './invoice-service';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {EditAutoInvoiceModel} from '../models/invoice/edit-auto-invoice.model';
import {environment} from '../../environments/environment';
import {GlLineItem} from '../models/line-item/line-item-model';

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
      invoiceDate: new Date(),
      costLineItems: [{}],
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

  it('should refresh master data', async () => {
    spyOn(web, 'httpPost').and.returnValue(of(invoice));
    const result = await invoiceService.refreshMasterData(invoice).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(result).toEqual(invoice);
  });

  it('should get invoice details', async () => {
    const freightOrders = await invoiceService.getFreightOrderDetails().toPromise();
    expect(freightOrders.length).toBe(1);

  });

  it('should return Observable when updateAutoInvoice invoked', (done) => {
    const body: EditAutoInvoiceModel = {} as any;
    const falconInvoiceNumber = 'F0000001234';
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
    ));
  });

  it('should return error when updateAutoInvoice invoked and fails', (done) => {
    const body: EditAutoInvoiceModel = {} as any;
    const falconInvoiceNumber = 'F0000001234';
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
    ));
  });

  it('should return null when no errors were found', (done) => {
    const body: GlLineItem = {} as any;
    const env = environment;
    env.baseServiceUrl = 'https://somedomain.com';
    spyOn(web, 'httpPost').and.returnValue(of(null));
    subscription.add(invoiceService.validateGlLineItem(body).subscribe(
      (result) => {
        expect(result).toBeNull();
        expect(web.httpPost).toHaveBeenCalledOnceWith(`${env.baseServiceUrl}/v1/invoice/auto/validate`, body);
        done();
      },
      () => fail(`Subscription should have succeeded`)
    ));
  });

  it('should return Observable when getMasterDataScacs invoked', (done) => {
    const env = environment;
    env.baseServiceUrl = 'https://somedomain.com';
    spyOn(web, 'httpGet').and.returnValue(of([]));
    subscription.add(invoiceService.getMasterDataScacs().subscribe(
      (result) => {
        expect(result).toEqual([]);
        expect(web.httpGet).toHaveBeenCalledOnceWith(`${env.baseServiceUrl}/v1/carriers`);
        done();
      },
      () => fail(`Subscription should have succeeded`)
    ));
  });

  it('should return error when getMasterDataScacs invoked and fails', (done) => {
    const env = environment;
    env.baseServiceUrl = 'https://somedomain.com';
    spyOn(web, 'httpGet').and.returnValue(throwError(new Error('Bad')));
    subscription.add(invoiceService.getMasterDataScacs().subscribe(
      (result) => {
        fail(`Subscription should have failed`);
      },
      (error: Error) => {
        expect(error.message).toEqual('Bad');
        expect(web.httpGet).toHaveBeenCalledOnceWith(`${env.baseServiceUrl}/v1/carriers`);
        done();
      }
    ));
  });

  it('should return Observable with persisted true when getInvoice invoked', (done) => {
    const date = new Date();

    const initialInvoice = {
      falconInvoiceNumber: 'F0000000001',
      companyCode: '1234',
      vendorNumber: '2345',
      externalInvoiceNumber: '3456',
      invoiceDate: date,
      costLineItems: [{}],
    };

    const returnInvoice = {
      falconInvoiceNumber: 'F0000000001',
      companyCode: '1234',
      vendorNumber: '2345',
      externalInvoiceNumber: '3456',
      invoiceDate: date,
      costLineItems: [{ persisted: true }],
    };
    const env = environment;
    env.baseServiceUrl = 'https://somedomain.com';
    spyOn(web, 'httpGet').and.returnValue(of(initialInvoice));
    subscription.add(invoiceService.getInvoice('foo').subscribe(
      (result) => {
        // @ts-ignore
        expect(result).toEqual(returnInvoice);
        expect(web.httpGet).toHaveBeenCalledOnceWith(`${env.baseServiceUrl}/v1/invoice/foo`);
        done();
      },
      () => fail(`Subscription should have succeeded`)
    ));
  });

  it('should return Observable with undefined costLineItems when getInvoice invoked and no costLineItems', (done) => {
    const date = new Date();

    const initialInvoice = {
      falconInvoiceNumber: 'F0000000001',
      companyCode: '1234',
      vendorNumber: '2345',
      externalInvoiceNumber: '3456',
      invoiceDate: date,
    };

    const returnInvoice = {
      falconInvoiceNumber: 'F0000000001',
      companyCode: '1234',
      vendorNumber: '2345',
      externalInvoiceNumber: '3456',
      invoiceDate: date,
      costLineItems: undefined,
    };
    const env = environment;
    env.baseServiceUrl = 'https://somedomain.com';
    spyOn(web, 'httpGet').and.returnValue(of(initialInvoice));
    subscription.add(invoiceService.getInvoice('foo').subscribe(
      (result) => {
        // @ts-ignore
        expect(result).toEqual(returnInvoice);
        expect(web.httpGet).toHaveBeenCalledOnceWith(`${env.baseServiceUrl}/v1/invoice/foo`);
        done();
      },
      () => fail(`Subscription should have succeeded`)
    ));
  });
});
