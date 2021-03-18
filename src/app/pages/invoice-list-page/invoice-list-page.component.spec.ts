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
import {InvoiceDataModel} from '../../models/invoice/invoice-model';

describe('InvoiceListPageComponent', () => {
  let component: InvoiceListPageComponent;
  let fixture: ComponentFixture<InvoiceListPageComponent>;
  let webservice: WebServices;
  let http: HttpTestingController;
  let loadingService: LoadingService;

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
      externalInvoiceNumber: '1'
    }, {
      externalInvoiceNumber: '2'
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
    expect(component.invoices[0].externalInvoiceNumber).toEqual('1');
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
    expect(component.sortFields).toEqual([sortEvent.active]);
    expect(component.paginationModel.sortOrder).toEqual(sortEvent.direction);
  }));

  it('should init with invoices from api', () => {
    component.getTableData(pageEvent.pageSize);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`)
      .flush(invoiceData);
    expect(component.invoices[0].externalInvoiceNumber)
      .toEqual(invoiceData.data[0].externalInvoiceNumber);
  });

  it('should do nothing on row click', () => {
    // falcon does not currently support row clicking
    component.rowClicked(new InvoiceDataModel(invoiceData.data[0]));
    expect().nothing();
  });
});
