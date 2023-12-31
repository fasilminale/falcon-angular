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
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {SearchComponent} from '../../components/search/search.component';
import {ModalService} from '@elm/elm-styleguide-ui';
import {PaginationModel} from '../../models/PaginationModel';
import {UtilService} from '../../services/util-service';
import {ElmUamPermission} from '../../utils/elm-uam-permission';
import {UserInfoModel} from '../../models/user-info/user-info-model';

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
  let searchComponent: SearchComponent;
  let fixture: ComponentFixture<InvoiceListPageComponent>;
  let webservice: WebServices;
  let http: HttpTestingController;
  let loadingService: LoadingService;
  let router: Router;
  let snackBar: MatSnackBar;
  let dialog: MatDialog;
  let filterService: FilterService;
  let userService: UserService;
  let modalService: ModalService;
  let utilService: UtilService;

  const userInfo = {
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
    uid: '12345',
    role: 'FAL_INTERNAL_TECH_ADIMN',
    permissions: [
      ElmUamPermission.ALLOW_INVOICE_WRITE
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

  const scacs: Array<any> = [{
    scac: 'ABCD',
    name: 'Vandalay Industries'
  }, {
    scac: 'EFGH',
    name: 'Kramerica'
  }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        RouterTestingModule,
      ],
      declarations: [InvoiceListPageComponent, SearchComponent],
      providers: [
        UntypedFormBuilder,
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
    webservice = TestBed.inject(WebServices);
    utilService = TestBed.inject(UtilService);
    loadingService = TestBed.inject(LoadingService);
    http = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    router = TestBed.inject(Router);
    dialog = TestBed.inject(MatDialog);
    userService = TestBed.inject(UserService);
    filterService = TestBed.inject(FilterService);
    modalService = TestBed.inject(ModalService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceListPageComponent);
    const searchComponentFixture: ComponentFixture<SearchComponent> = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    searchComponent = searchComponentFixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(userInfo);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoiceStatuses`).flush([]);
    http.expectOne(`${environment.baseServiceUrl}/v1/carrierShippingPoints`).flush([
      {
        shippingPointCode: 'd36'
      }
    ]);
    http.expectOne(`${environment.baseServiceUrl}/v1/carrierModeCodes`).flush([
      {
        mode: 'LNHL'
      }
    ]);
    http.expectOne(`${environment.baseServiceUrl}/v1/originDestinationCities`).flush([{
      originCities: ['New York'],
      destinationCities: ['Chicago']
    }]);
    const carriersCall = http.match((request) => {
      return request.url == `${environment.baseServiceUrl}/v1/carriers`;
    });
    expect(carriersCall.length === 2);

    carriersCall[0].flush(scacs);
    carriersCall[1].flush(scacs);

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
    expect(component.paginationModel.sortField).toEqual(sortEvent.active);
    expect(component.paginationModel.sortOrder).toEqual(sortEvent.direction);
  }));

  describe('check sort fields', () => {
    beforeEach(() => {
      spyOn(component, 'checkSortFields').and.callThrough();
    });

    it('statusLabel should be status', fakeAsync(() => {
      const result = component.checkSortFields('statusLabel');
      tick(150);
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('status');
    }));

    it('carrierDisplay should be carrier.name', fakeAsync(() => {
      const result = component.checkSortFields('carrierDisplay');
      tick(150);
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('carrier.name');
    }));

    it('carrierModeDisplay should be mode.mode', fakeAsync(() => {
      const result = component.checkSortFields('carrierModeDisplay');
      tick(150);
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('mode.mode');
    }));

    it('paymentDueDisplay should be paymentDue', fakeAsync(() => {
      const result = component.checkSortFields('paymentDueDisplay');
      tick(150);
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('paymentDue');
    }));

    it('lastPaidDate should be lastPaidDate', () => {
      const result = component.checkSortFields('lastPaidDate');
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('lastPaidDate');
    });

    it('originStr should be origin.city', fakeAsync(() => {
      const result = component.checkSortFields('originStr');
      tick(150);
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('origin.city');
    }));

    it('originStr should be destination.city', fakeAsync(() => {
      const result = component.checkSortFields('destinationStr');
      tick(150);
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual('destination.city');
    }));

    it('any other field should be unchanged', fakeAsync(() => {
      const falconInvoiceNumber = 'falconInvoiceNumber';
      const result = component.checkSortFields(falconInvoiceNumber);
      tick(150);
      fixture.detectChanges();
      expect(component.checkSortFields).toHaveBeenCalled();
      expect(result).toEqual(falconInvoiceNumber);
    }));
  });

  it('should Search Invoices with single result', fakeAsync(() => {
    spyOn(component, 'searchInvoices').and.callThrough();
    spyOn(component, 'getTableData').and.callThrough();
    component.searchInvoices('1');
    const navigateSpy = spyOn(router, 'navigate');
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush({
      data: [{
        falconInvoiceNumber: '1'
      }]
    });
    tick(150);
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['/invoice/1']);
    expect(component.searchInvoices).toHaveBeenCalled();
    expect(component.controlGroup.controls.control.value).toEqual('');
  }));

  it('should Search Invoices with multiple result', fakeAsync(() => {
    spyOn(component, 'searchInvoices').and.callThrough();
    spyOn(component, 'getTableData').and.callThrough();
    component.searchInvoices('1');
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
    tick(150);
    fixture.detectChanges();
    expect(component.getTableData).toHaveBeenCalled();
    expect(component.searchValue).toEqual('1');
  }));

  it('should Search Invoices with no result', fakeAsync(() => {
    spyOn(component, 'getTableData').and.callThrough();
    component.searchInvoices('1');
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush({data: [], total: 0});
    tick(150);
    fixture.detectChanges();
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

  it('should call clearSearchFilter and reset search', fakeAsync(() => {
    spyOn(component, 'resetTable').and.stub();
    spyOn(component.searchComponent, 'clear');
    component.searchValue = 'qwerty';
    component.clearSearchFilter();
    expect(component.resetTable).toHaveBeenCalled();
    expect(component.searchComponent.clear).toHaveBeenCalled();
    expect(component.searchValue).toEqual('');
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
    const dialogRefSpyObj = jasmine.createSpyObj({afterClosed: of({}), close: null});
    dialogRefSpyObj.componentInstance = {body: ''};

    beforeEach(() => {
      spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    });

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

    it('should call resetTable and clear search control on apply', fakeAsync(() => {
      spyOn(component, 'resetTable').and.callThrough();
      spyOn(component.searchComponent, 'clear');
      component.searchValue = 'qwerty';
      openModal();
      http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
      expect(component.resetTable).toHaveBeenCalled();
      expect(component.searchComponent.clear).toHaveBeenCalled();
      expect(component.searchValue).toEqual('');
    }));
  });

  it('should display the extract invoice remittance button', async () => {
    // make sure permissions are set for this test
    userInfo.permissions = [ElmUamPermission.ALLOW_INVOICE_WRITE];
    component.userInfo = new UserInfoModel(userInfo);
    fixture.detectChanges();

    // check that permission calculation works
    expect(component.hasAllPermissions([ElmUamPermission.ALLOW_INVOICE_WRITE])).toBeTrue();

    // wait for template to update based on detect changes
    await fixture.whenStable();
    const extractButton = fixture.debugElement.query(By.css('#extract-invoice-button'));
    expect(extractButton).not.toBeNull();
  });

  it('should not display the extract invoice remittance button', async () => {
    // make sure permissions are set for this test
    userInfo.permissions = [];
    component.userInfo = new UserInfoModel(userInfo);
    fixture.detectChanges();

    // check that permission calculation works
    expect(component.hasAllPermissions([ElmUamPermission.ALLOW_INVOICE_WRITE])).toBeFalse();

    // wait for template to update based on detect changes
    await fixture.whenStable();
    const extractButton = fixture.debugElement.query(By.css('#extract-invoice-button'));
    expect(extractButton).toBeNull();
  });

  it('should prompt user before downloading a list of invoices', fakeAsync(() => {
    spyOn(utilService, 'downloadCsv').and.stub();
    spyOn(component, 'callCSVApi').and.callThrough();
    component.downloadCsv();
    fixture.whenStable().then(() => {
      expect(component.callCSVApi).toHaveBeenCalled();
      expect(utilService.downloadCsv).toHaveBeenCalled();
    });
  }));

  it('should download a list of invoices', fakeAsync(() => {
    component.filterService.invoiceFilterModel.fb.group({invoiceStatuses: new UntypedFormArray([])});
    const formArray: any = component.filterService.invoiceFilterModel.form.get('invoiceStatuses');
    formArray.push(new UntypedFormControl('APPROVED'));
    spyOn(utilService, 'downloadCsv').and.stub();
    component.downloadCsv();
    expect(utilService.downloadCsv).toHaveBeenCalled();
  }));

  it('should destroy when ngOnDestory is called', () => {
    const sub = component.subscription;
    const service = component.userService;
    const paginationModel = new PaginationModel();
    const controlGroup = new UntypedFormGroup({});
    component.paginationModel = paginationModel;
    component.controlGroup = controlGroup;
    spyOn(sub, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
    expect(service.searchState).toBe(paginationModel);
    expect(service.controlGroupState).toBe(controlGroup);
  });

  it('routeToExtractPage should navigate', () => {
    spyOn(router, 'navigate').and.stub();
    component.routeToExtractPage();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/invoice-extraction']);
  });

  it('routeToManageInvoiceLocksPage should navigate', () => {
    spyOn(router, 'navigate').and.stub();
    component.routeToManageInvoiceLocksPage();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/manage-invoice-locks']);
  });

});

