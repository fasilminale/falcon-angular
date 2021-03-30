import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {InvoiceListPageComponent} from './invoice-list-page.component';
import {RouterTestingModule} from '@angular/router/testing';
import {WebServices} from '../../services/web-services';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../../environments/environment';
import {PageEvent} from '@angular/material/paginator';
import {LoadingService} from '../../services/loading-service';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Router} from '@angular/router';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';

describe('InvoiceListPageComponent', () => {
  let component: InvoiceListPageComponent;
  let fixture: ComponentFixture<InvoiceListPageComponent>;
  let webservice: WebServices;
  let http: HttpTestingController;
  let loadingService: LoadingService;
  let router: Router;

  const pageEvent = new PageEvent();
  pageEvent.pageSize = 30;
  pageEvent.pageIndex = 1;

  const sortEvent = {
    active: 'externalInvoiceNumber',
    direction: 'desc'
  };

  const invoiceData = {
    total: 1,
    data: [{
      falconInvoiceNumber: '1'
    }, {
      falconInvoiceNumber: '2'
    }]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, NoopAnimationsModule],
      declarations: [InvoiceListPageComponent],
      providers: [WebServices, LoadingService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
    webservice = TestBed.inject(WebServices);
    loadingService = TestBed.inject(LoadingService);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get table data',  fakeAsync(() => {
    expect(component.invoices[0].falconInvoiceNumber).toEqual('1');
  }));

  it('should Page Change', fakeAsync( () => {
    spyOn(component, 'pageChanged').and.callThrough();
    spyOn(component, 'getTableData').and.callThrough();
    component.pageChanged(pageEvent);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
    tick(150);
    fixture.detectChanges();
    expect(component.pageChanged).toHaveBeenCalled();
    expect(component.getTableData).toHaveBeenCalled();
    expect(component.paginationModel.pageIndex).toEqual(2);
    expect(component.paginationModel.numberPerPage).toEqual(30);
  }));

  it('should Sort Fields', fakeAsync( () => {
    spyOn(component, 'sortChanged').and.callThrough();
    spyOn(component, 'getTableData').and.callThrough();
    component.sortChanged(sortEvent);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
    tick(150);
    fixture.detectChanges();
    expect(component.sortChanged).toHaveBeenCalled();
    expect(component.getTableData).toHaveBeenCalled();
    expect(component.sortField).toEqual(sortEvent.active);
    expect(component.paginationModel.sortOrder).toEqual(sortEvent.direction);
  }));

  it('should init with invoices from api', () => {
    component.getTableData(pageEvent.pageSize);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`)
      .flush(invoiceData);
    expect(component.invoices[0].falconInvoiceNumber)
      .toEqual(invoiceData.data[0].falconInvoiceNumber);
  });

  it('should route to a load with an input string',  fakeAsync(() => {
    const invoice = new InvoiceDataModel({falconInvoiceNumber: '1'});
    const navigateSpy = spyOn(router, 'navigate');
    component.rowClicked(invoice);
    expect(navigateSpy).toHaveBeenCalledWith(['/invoice/1']);
  }));
});
