import {ComponentFixture, TestBed} from '@angular/core/testing';

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
import {ElmUamPermission} from '../../utils/elm-uam-permission';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {UserService} from '../../services/user-service';
import {SubjectValue} from '../../utils/subject-value';
import { environment } from 'src/environments/environment';
import { ToastService } from '@elm/elm-styleguide-ui';

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

  const $userInfo = new SubjectValue(
    new UserInfoModel({
      firstName: 'test',
      lastName: 'user',
      email: 'test@test.com',
      uid: '12345',
      role: 'FAL_INTERNAL_TECH_ADIMN',
      permissions: [
        ElmUamPermission.ALLOW_INVOICE_WRITE
      ]
    })
  );

  let component: InvoiceLockListPageComponent;
  let fixture: ComponentFixture<InvoiceLockListPageComponent>;
  let router: Router;
  let webService: WebServices;
  let userService: UserService;
  let toastService: ToastService;

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
    router = TestBed.inject(Router);
    webService = TestBed.inject(WebServices);
    userService = TestBed.inject(UserService);
    toastService = TestBed.inject(ToastService);
    spyOn(userService, 'getUserInfo').and.returnValue($userInfo.asObservable());
    fixture = TestBed.createComponent(InvoiceLockListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get user info', async () => {
    await fixture.whenStable();
    expect(component.userInfo).toEqual($userInfo.value);
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

  it('should add falcon invoice number to unlockInvoices', () => {
    component.unlockInvoices = [];
    const invoice1 = new InvoiceDataModel({falconInvoiceNumber: '1', entryType: 'AUTO'});
    const invoice2 = new InvoiceDataModel({falconInvoiceNumber: '2', entryType: 'AUTO'});
    component.rowSelected([invoice1, invoice2]);
    expect(component.unlockInvoices).toEqual(['1', '2']);
  });

  it('should remove selected falcon invoice number from unlockInvoices', () => {
    component.unlockInvoices = ['1', '2'];
    component.rowSelected([]);
    expect(component.unlockInvoices).toEqual([]);
  });

  it('should unlock invoices with error', () => {
    component.unlockInvoices = ['1'];
    const response = {'message': 'ERROR'};
    spyOn(webService, 'httpPost').and.returnValue(of(response));
    spyOn(toastService, 'openErrorToast');
    component.unlockSelectedInvoices();
    fixture.detectChanges();
    expect(component.toastService.openErrorToast).toHaveBeenCalled();
  });

  it('should unlock invoices with success', () => {
    component.unlockInvoices = ['1', '2'];
    const response = {'message': 'SUCCESS'};
    spyOn(webService, 'httpPost').and.returnValue(of(response));
    spyOn(toastService, 'openSuccessToast');
    component.unlockSelectedInvoices();
    fixture.detectChanges();
    expect(component.toastService.openSuccessToast).toHaveBeenCalled();
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

    it('lastPaidDate should be lastPaidDate', () => {
      const result = component.checkSortFields('lastPaidDate');
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('lastPaidDate');
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
