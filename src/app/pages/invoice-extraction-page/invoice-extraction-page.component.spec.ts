import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {InvoiceExtractionPageComponent} from './invoice-extraction-page.component';
import {RouterTestingModule} from '@angular/router/testing';
import {WebServices} from '../../services/web-services';
import {HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../../environments/environment';
import {PageEvent} from '@angular/material/paginator';
import {LoadingService} from '../../services/loading-service';
import {ActivatedRoute, Router} from '@angular/router';
import {EntryType, InvoiceDataModel} from '../../models/invoice/invoice-model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {of} from 'rxjs';
import {StatusModel} from '../../models/invoice/status-model';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MatDialog} from '@angular/material/dialog';
import {FilterService} from '../../services/filter-service';
import {InvoiceService} from "../../services/invoice-service";
import {EnvironmentService} from "../../services/environment-service/environment-service";
import {ButtonClickedEvent, ModalService} from "@elm/elm-styleguide-ui";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { WindowService } from 'src/app/services/window-service/window-service';
import {Sort} from '@angular/material/sort';

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


describe('InvoiceExtractionPageComponent', () => {
  let component: InvoiceExtractionPageComponent;
  let fixture: ComponentFixture<InvoiceExtractionPageComponent>;
  let webservice: WebServices;
  let http: HttpTestingController;
  let loadingService: LoadingService;
  let router: Router;
  let snackBar: MatSnackBar;
  let dialog: MatDialog;
  let filterService: FilterService;
  let modalService: ModalService;
  let invoiceService: InvoiceService;
  let windowService: WindowService;
  let environmentService: EnvironmentService;

  const pageEvent = new PageEvent();
  pageEvent.pageSize = 30;
  pageEvent.pageIndex = 1;

  const sortEvent = {
    active: 'externalInvoiceNumber',
    direction: 'desc'
  } as Sort;

  const scacs: Array<any> = [
    {scac: "C007", name: "RENAL FLEET"},
    {scac: "PYLE", name: "A DUIE"}
  ];

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
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [InvoiceExtractionPageComponent],
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
    filterService = TestBed.inject(FilterService);
    modalService = TestBed.inject(ModalService);
    invoiceService = TestBed.inject(InvoiceService);
    windowService = TestBed.inject(WindowService);
    environmentService = TestBed.inject(EnvironmentService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceExtractionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`).flush(invoiceData);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoiceStatuses`).flush([]);
    http.expectOne(`${environment.baseServiceUrl}/v1/carriers`).flush(scacs);
  });

  afterEach(() => {
    http.verify();
  });

  describe('openLoadInNewTab', () => {
    it('should test window open event', () => {
      const newWindowSpy = spyOn(windowService, 'openInNewWindow').and.stub();
      const invoice = new InvoiceDataModel({falconInvoiceNumber: 'F0000000001'});
      const event: ButtonClickedEvent = {rowData: invoice, rowIndex: 0, header: ''};
      component.buttonClicked(event);
      expect(newWindowSpy).toHaveBeenCalledWith('invoice/F0000000001');
    });

    it('should open AUTO invoice', () => {
      const newWindowSpy = spyOn(windowService, 'openInNewWindow').and.stub();
      const invoice = new InvoiceDataModel({falconInvoiceNumber: 'F0000000001', entryType: EntryType.AUTO});
      const event: ButtonClickedEvent = {rowData: invoice, rowIndex: 0, header: ''};
      component.buttonClicked(event);
      expect(newWindowSpy).toHaveBeenCalledWith('invoice/F0000000001/AUTO');
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get table data', fakeAsync(() => {
    expect(component.invoices[0].falconInvoiceNumber).toEqual('1');
  }));

  it('should Extract', async () => {
      spyOn(modalService, 'openConfirmationModal').and.returnValue(of(true));
      spyOn(invoiceService, 'extract').and.returnValue(of({}));
      spyOn(component, 'getTableData').and.stub();
      component.selectedInvoicesToExtract = [{'falconInvoiceNumber': 'F0000000001'} as InvoiceDataModel];
      let promise = component.extract();
      await promise;
      expect(invoiceService.extract).toHaveBeenCalledWith('F0000000001');
  });

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

  it('should init with invoices from api', () => {
    component.getTableData(pageEvent.pageSize);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoices`)
      .flush(invoiceData);
    expect(component.invoices[0].falconInvoiceNumber)
      .toEqual(invoiceData.data[0].falconInvoiceNumber);
  });




});
