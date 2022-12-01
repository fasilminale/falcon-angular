import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import { WebServices } from './web-services';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {of, Subject} from 'rxjs';
import { UserService } from './user-service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {InvoiceLockService} from './invoice-lock-service';
import {InvoiceService} from './invoice-service';
import {InvoiceLockModel} from '../models/invoice/invoice-lock-model';

describe('InvoiceLockService', () => {
  let invoiceLockService: InvoiceLockService;
  let web: WebServices;
  const invoiceLock = {
    falconInvoiceNumber: 'F0000000001',
    user: 'test@test.com',
    fullName: 'test',
    currentUser: false,
    dateTimeCreated: new Date().toISOString(),
    dateTimeExpiration: new Date().toISOString()
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        InvoiceService,
        WebServices,
        FormBuilder,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    invoiceLockService = TestBed.inject(InvoiceLockService);
    web = TestBed.inject(WebServices);
  });

  it('should create', () => {
    expect(web).toBeTruthy();
  });

  it('should get invoice lock', async () => {
    invoiceLockService.invoiceLock = invoiceLock;
    const lock = invoiceLockService.getInvoiceLock();
    expect(lock).toBeTruthy();
  });

  it('should retrieve invoice lock', fakeAsync( () => {
    spyOn(web, 'httpGet').and.returnValue(of(invoiceLock));
    invoiceLockService.retrieveInvoiceLock(invoiceLock.falconInvoiceNumber).toPromise();
    tick();
    expect(web.httpGet).toHaveBeenCalledTimes(1);
  }));

  it('should retrieve existing invoice lock', fakeAsync( () => {
    invoiceLockService.invoiceLock = new InvoiceLockModel();
    spyOn(web, 'httpGet').and.returnValue(of(invoiceLock));
    invoiceLockService.retrieveInvoiceLock(invoiceLock.falconInvoiceNumber).toPromise();
    tick();
    expect(web.httpGet).toHaveBeenCalledTimes(0);
  }));

  it('should not call api to delete invoice lock', fakeAsync( () => {
    spyOn(web, 'httpPost').and.returnValue(of());
    invoiceLockService.releaseInvoiceLock();
    tick();
    expect(web.httpPost).toHaveBeenCalledTimes(0);
  }));

  it('should call api to delete invoice lock',  done => {
    const invoiceLockResponse$ = new Subject<any>();
    invoiceLockService.invoiceLock = new InvoiceLockModel();
    spyOn(web, 'httpPost').and.returnValue(invoiceLockResponse$.asObservable());
    invoiceLockService.releaseInvoiceLock();
    invoiceLockResponse$.subscribe(() => {
      expect(web.httpPost).toHaveBeenCalledTimes(1);
      done();
    });

    invoiceLockResponse$.next();
  });

  it('should call api to create invoice lock', fakeAsync( () => {
    spyOn(web, 'httpPost').and.returnValue(of(invoiceLock));
    invoiceLockService.createInvoiceLock(invoiceLock.falconInvoiceNumber);
    tick();
    expect(web.httpPost).toHaveBeenCalledTimes(1);
  }));

  it('should not call api to create invoice lock', fakeAsync( () => {
    invoiceLockService.invoiceLock = new InvoiceLockModel();
    spyOn(web, 'httpPost').and.returnValue(of(invoiceLock));
    invoiceLockService.createInvoiceLock(invoiceLock.falconInvoiceNumber);
    tick();
    expect(web.httpPost).toHaveBeenCalledTimes(0);
  }));
});
