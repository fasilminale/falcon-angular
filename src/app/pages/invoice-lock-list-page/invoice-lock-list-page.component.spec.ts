import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {InvoiceLockListPageComponent} from './invoice-lock-list-page.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {RouterTestingModule} from '@angular/router/testing';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {of} from 'rxjs';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {Sort} from '@angular/material/sort';
import {WebServices} from '../../services/web-services';
import {PageEvent} from '@angular/material/paginator';
import {environment} from '../../../environments/environment';

class MockActivatedRoute extends ActivatedRoute {
  constructor(private map: any) {
    super();
    this.queryParams = of(map);
  }
}

class DialogMock {
  open(): any {
    return {
      afterClosed: () => of(true)
    };
  }
}

describe('InvoiceLockListPageComponent', () => {

  const invoiceData = {
    total: 1,
    data: [{
      falconInvoiceNumber: '1'
    }, {
      falconInvoiceNumber: '2'
    }]
  };

  const sortEvent = {
    active: 'externalInvoiceNumber',
    direction: 'desc'
  } as Sort;

  const pageEvent = new PageEvent();
  pageEvent.pageSize = 30;
  pageEvent.pageIndex = 1;

  let component: InvoiceLockListPageComponent;
  let fixture: ComponentFixture<InvoiceLockListPageComponent>;
  let router: Router;
  let webService: WebServices;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        RouterTestingModule,
      ],
      declarations: [InvoiceLockListPageComponent],
      providers: [
        FormBuilder,
        {
          provide: MatDialog,
          useClass: DialogMock
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({falconInvoiceNumber: '1'})
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(InvoiceLockListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
    webService = TestBed.inject(WebServices);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should route to a manual invoice edit page', () => {
    const invoice = new InvoiceDataModel({falconInvoiceNumber: '1'});
    const navigateSpy = spyOn(router, 'navigate').and.stub();
    component.rowClicked(invoice);
    expect(navigateSpy).toHaveBeenCalledWith(['/invoice/1']);
  });

  it('should route to an auto invoice edit page', () => {
    const invoice = new InvoiceDataModel({falconInvoiceNumber: '1', entryType: 'AUTO'});
    const navigateSpy = spyOn(router, 'navigate').and.stub();
    component.rowClicked(invoice);
    expect(navigateSpy).toHaveBeenCalledWith(['/invoice/1/AUTO']);
  });

  it('should Sort Fields', () => {
    spyOn(component, 'sortChanged').and.callThrough();
    spyOn(component, 'getTableData').and.callThrough();
    spyOn(webService, 'httpPost').and.returnValue(of(invoiceData));
    component.sortChanged(sortEvent);
    fixture.detectChanges();
    expect(component.sortChanged).toHaveBeenCalled();
    expect(component.getTableData).toHaveBeenCalled();
    expect(component.paginationModel.sortField).toEqual(sortEvent.active);
    expect(component.paginationModel.sortOrder).toEqual(sortEvent.direction);
  });

  describe('check sort fields', () => {
    beforeEach(() => {
      spyOn(component, 'checkSortFields').and.callThrough();
    });

    it('statusLabel should be status', () => {
      const result = component.checkSortFields('statusLabel');
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('status');
    });

    it('carrierDisplay should be carrier.name', () => {
      const result = component.checkSortFields('carrierDisplay');
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('carrier.name');
    });

    it('carrierModeDisplay should be mode.mode', () => {
      const result = component.checkSortFields('carrierModeDisplay');
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('mode.mode');
    });

    it('paymentDueDisplay should be paymentDue', () => {
      const result = component.checkSortFields('paymentDueDisplay');
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('paymentDue');
    });

    it('originStr should be origin.city', () => {
      const result = component.checkSortFields('originStr');
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('origin.city');
    });

    it('originStr should be destination.city', () => {
      const result = component.checkSortFields('destinationStr');
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('destination.city');
    });

    it('any other field should be unchanged', () => {
      const falconInvoiceNumber = 'falconInvoiceNumber';
      const result = component.checkSortFields(falconInvoiceNumber);
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual(falconInvoiceNumber);
    });
  });

  it('should Page Change', () => {
    spyOn(component, 'pageChanged').and.callThrough();
    spyOn(component, 'getTableData').and.callThrough();
    spyOn(webService, 'httpPost').and.returnValue(of(invoiceData));
    component.pageChanged(pageEvent);
    fixture.detectChanges();
    expect(component.pageChanged).toHaveBeenCalled();
    expect(component.getTableData).toHaveBeenCalled();
    expect(component.paginationModel.pageIndex).toEqual(2);
    expect(component.paginationModel.numberPerPage).toEqual(30);
  });

});
