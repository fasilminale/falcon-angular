import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InvoiceListPageComponent} from './invoice-list-page.component';
import {RouterTestingModule} from '@angular/router/testing';
import {WebServices} from '../../services/web-services';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../../environments/environment';
import {EXAMPLE_INVOICE} from '../../models/invoice-model';
import {PageEvent} from '@angular/material/paginator';

describe('InvoiceListPageComponent', () => {
  let component: InvoiceListPageComponent;
  let fixture: ComponentFixture<InvoiceListPageComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [InvoiceListPageComponent],
      providers: [WebServices]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // consume the initial http call so tests don't have to catch it
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush([]);
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init with invoices from api', () => {
    component.loadInvoices();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`)
      .flush([EXAMPLE_INVOICE]);
    expect(component.invoices).toEqual([EXAMPLE_INVOICE]);
    expect(component.paginationModel).toEqual({total: 1, pageSizes: [1]});
  });

  it('should handle failing invoices call', () => {
    component.loadInvoices();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`)
      .error(new ErrorEvent('test error event'), {
        status: 123,
        statusText: 'test status text'
      });
    expect(component.invoices).toEqual([]);
    expect(component.paginationModel).toEqual({total: 0, pageSizes: [0]});
  });

  it('should do nothing on row click', () => {
    // falcon does not currently support row clicking
    component.rowClicked(EXAMPLE_INVOICE);
    expect().nothing();
  });

  it('should do nothing on page change', () => {
    // falcon does not currently support pagination
    component.pageChanged(new PageEvent());
    expect().nothing();
  });

});
