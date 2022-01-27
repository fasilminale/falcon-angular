import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {InvoiceListPageComponent} from './invoice-list-page.component';
import {RouterTestingModule} from '@angular/router/testing';
import {WebServices} from '../../services/web-services';
import {HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../../environments/environment';
import {PageEvent} from '@angular/material/paginator';
import {LoadingService} from '../../services/loading-service';
import {ActivatedRoute, Router} from '@angular/router';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {of} from 'rxjs';
import {StatusModel} from '../../models/invoice/status-model';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MatDialog} from '@angular/material/dialog';
import {FilterService} from '../../services/filter-service';
import {Sort} from '@angular/material/sort';
import {UserService} from '../../services/user-service';
import {By} from '@angular/platform-browser';

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

describe('InvoiceListPageComponent', () => {
  let component: InvoiceListPageComponent;
  let fixture: ComponentFixture<InvoiceListPageComponent>;
  let webservice: WebServices;
  let http: HttpTestingController;
  let loadingService: LoadingService;
  let router: Router;
  let snackBar: MatSnackBar;
  let dialog: MatDialog;
  let filterService: FilterService;
  let userService: UserService;

  const userInfo = {
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
    uid: '12345',
    role: 'FAL_INTERNAL_TECH_ADIMN',
    permissions: [
      'falRestrictInvoiceWrite'
    ]
  };

  const pageEvent = new PageEvent();
  pageEvent.pageSize = 30;
  pageEvent.pageIndex = 1;

  const sortEvent = {
    active: 'externalInvoiceNumber',
    direction: 'desc'
  } as Sort;

  const invoiceData = {
    total: 1,
    data: [{
      falconInvoiceNumber: '1'
    }, {
      falconInvoiceNumber: '2'
    }]
  };
  const invoiceStatuses: Array<StatusModel> = [
    {
      label: 'Created',
      key: 'CREATED'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        RouterTestingModule,
      ],
      declarations: [InvoiceListPageComponent],
      providers: [
        {
          provide: MatDialog,
          useClass: DialogMock
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({ falconInvoiceNumber: '1' })
        }
      ]
    }).compileComponents();
    webservice = TestBed.inject(WebServices);
    loadingService = TestBed.inject(LoadingService);
    http = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    router = TestBed.inject(Router);
    dialog = TestBed.inject(MatDialog);
    userService = TestBed.inject(UserService);
    filterService = TestBed.inject(FilterService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(userInfo);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get table data', fakeAsync(() => {
    expect(component.invoices[0].falconInvoiceNumber).toEqual('1');
  }));

  it('should Page Change', fakeAsync(() => {
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

  it('should Sort Fields', fakeAsync(() => {
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

  it('should Search Invoices', fakeAsync(() => {
    spyOn(component, 'searchInvoices').and.callThrough();
    spyOn(component, 'getTableData').and.callThrough();
    component.searchInvoices('1');
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
    tick(150);
    fixture.detectChanges();
    expect(component.searchInvoices).toHaveBeenCalled();
    expect(component.getTableData).toHaveBeenCalled();
    expect(component.searchValue).toEqual('1');
  }));

  it('should Search Invoices by status', fakeAsync(() => {
    spyOn(component, 'changeInvoiceStatus').and.callThrough();
    spyOn(component, 'getTableData').and.callThrough();
    component.changeInvoiceStatus(invoiceStatuses);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
    tick(150);
    fixture.detectChanges();
    expect(component.changeInvoiceStatus).toHaveBeenCalled();
    expect(component.getTableData).toHaveBeenCalled();
    expect(component.selectedInvoiceStatuses).toEqual(['CREATED']);
  }));

  it('should Search Invoices by created user', fakeAsync(() => {
    spyOn(component, 'changeCreatedByUser').and.callThrough();
    spyOn(component, 'getTableData').and.callThrough();
    component.changeCreatedByUser();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
    tick(150);
    fixture.detectChanges();
    expect(component.changeCreatedByUser).toHaveBeenCalled();
    expect(component.getTableData).toHaveBeenCalled();
    expect(component.createdByUser).toEqual(true);
  }));

  it('should init with invoices from api', () => {
    component.getTableData(pageEvent.pageSize);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`)
      .flush(invoiceData);
    expect(component.invoices[0].falconInvoiceNumber)
      .toEqual(invoiceData.data[0].falconInvoiceNumber);
  });

  it('should route to an manual invoice edit page', fakeAsync(() => {
    const invoice = new InvoiceDataModel({falconInvoiceNumber: '1'});
    const navigateSpy = spyOn(router, 'navigate');
    component.rowClicked(invoice);
    expect(navigateSpy).toHaveBeenCalledWith(['/invoice/1']);
  }));

  it('should route to an auto invoice edit page', fakeAsync(() => {
    const invoice = new InvoiceDataModel({falconInvoiceNumber: '1', entryType: 'AUTO'});
    const navigateSpy = spyOn(router, 'navigate');
    component.rowClicked(invoice);
    expect(navigateSpy).toHaveBeenCalledWith(['/invoice/1/AUTO']);
  }));

  describe('openFilter', () => {
    function openModal(): void {
      spyOn(component, 'openFilter').and.callThrough();
      component.openFilter();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const dialogDiv = document.querySelector('mat-dialog-container');
        const applyButton = dialogDiv?.querySelector('#apply-filter');
        const mouseEvent = new MouseEvent('click');
        applyButton?.dispatchEvent(mouseEvent);
      });
      tick(150);
    }

    it('should call resetTable on apply', fakeAsync(() => {
      spyOn(component, 'resetTable').and.callThrough();
      openModal();
      http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
      expect(component.resetTable).toHaveBeenCalled();
    }));
  });

  it('should display the extract invoice remittance button', () => {
    component.hasInvoiceWrite = true;
    fixture.detectChanges();
    const deleteBtn = fixture.debugElement.query(By.css('#extract-invoice-button'));
    expect(deleteBtn).not.toBeNull();
  });

  it('should not display the extract invoice remittance button', () => {
    component.hasInvoiceWrite = false;
    fixture.detectChanges();
    const deleteBtn = fixture.debugElement.query(By.css('#extract-invoice-button'));
    expect(deleteBtn).toBeNull();
  });
});
