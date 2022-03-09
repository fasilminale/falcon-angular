import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
import {PaginationModel} from '../../models/PaginationModel';
import {LoadingService} from '../../services/loading-service';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {DataTableComponent, ElmDataTableHeader, ToastService} from '@elm/elm-styleguide-ui';
import {StatusModel} from '../../models/invoice/status-model';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {InvoiceFilterModalComponent} from '../../components/invoice-filter-modal/invoice-filter-modal.component';
import {FilterService} from '../../services/filter-service';
import {Sort} from '@angular/material/sort';
import {ElmUamRoles} from '../../utils/elm-uam-roles';
import {UserService} from '../../services/user-service';
import {UserInfoModel} from '../../models/user-info/user-info-model';

@Component({
  selector: 'app-invoice-list-page',
  templateUrl: './invoice-list-page.component.html',
  styleUrls: ['./invoice-list-page.component.scss']
})
export class InvoiceListPageComponent implements OnInit, OnDestroy {
  public userInfo: UserInfoModel | undefined;
  paginationModel: PaginationModel = new PaginationModel();
  headers: Array<ElmDataTableHeader> = [
    {header: 'statusLabel', label: 'Status'},
    {header: 'falconInvoiceNumber', label: 'Falcon Invoice Number'},
    {header: 'invoiceReference', label: 'Invoice Reference'},
    {header: 'carrierDisplay', label: 'Carrier'},
    {header: 'carrierModeDisplay', label: 'Carrier Mode'},
    {header: 'businessUnit', label: 'Business Unit'},
    {header: 'invoiceDate', label: 'Invoice Date'},
    {header: 'paymentDueDisplay', label: 'Payment Due'},
    {header: 'amountOfInvoice', label: 'Invoice Net Amount', alignment: 'end'},
    {header: 'currency', label: 'Currency'},
  ];
  invoices: Array<InvoiceDataModel> = [];
  sortField = '';
  searchValue = '';
  createdByUser = false;
  totalSearchResult = 0;
  selectedInvoiceStatuses: Array<string> = [];
  invoiceCountLabel = 'Invoices';
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  invoiceFilter!: MatDialogRef<any>;
  invoiceStatuses: Array<StatusModel> = [];

  private readonly requiredPermissions = [ElmUamRoles.ALLOW_INVOICE_WRITE];
  public hasInvoiceWrite = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private webservice: WebServices,
    private dialog: MatDialog,
    public filterService: FilterService,
    public userService: UserService,
    private toastService: ToastService
  ) {
  }

  ngOnInit(): void {
    this.paginationModel = this.userService.searchState;
    this.getTableData(this.paginationModel.numberPerPage);
    this.route.queryParamMap.subscribe(queryParams => {
      const falconInvoiceNumber = queryParams.get('falconInvoiceNumber');
      if (falconInvoiceNumber) {
        this.toastService.openSuccessToast(`Success! Falcon Invoice ${falconInvoiceNumber} has been deleted.`, 5 * 1000);
      }
    });
    this.userService.getUserInfo().subscribe(userInfo => {
      this.userInfo = new UserInfoModel(userInfo);
      this.hasInvoiceWrite = this.userInfo.hasPermission(this.requiredPermissions);
    });
  }

  ngOnDestroy(): void {
    this.userService.searchState = this.paginationModel;
  }

  getTableData(numberPerPage: number, isInvoiceSearched = false): void {
    this.loadingService.showLoading('Loading');
    const searchFilters = this.filterService.invoiceFilterModel.formatForSearch();
    this.webservice.httpPost(`${environment.baseServiceUrl}/v1/invoices`, {
      page: this.paginationModel.pageIndex,
      sortField: this.sortField ? this.sortField : 'falconInvoiceNumber',
      sortOrder: this.paginationModel.sortOrder ? this.paginationModel.sortOrder : 'desc',
      searchValue: this.searchValue,
      createdByUser: this.createdByUser,
      ...searchFilters,
      numberPerPage
    }).subscribe((invoiceData: any) => {
      if(invoiceData?.data?.length === 1) {
          this.rowClicked(invoiceData.data[0]);
      } else  {
        this.paginationModel.total = invoiceData.total;
        this.totalSearchResult = invoiceData.total;
        if(!isInvoiceSearched || this.totalSearchResult !== 0) {
        this.invoiceCountLabel = this.createdByUser
          ? `My Invoices (${this.paginationModel.total})`
          : (this.searchValue || this.selectedInvoiceStatuses.length > 0)
            ? `Invoices (${this.paginationModel.total})`
            : 'Invoices';
        const invoiceArray: Array<InvoiceDataModel> = [];
        invoiceData.data.map((invoice: any) => {
          invoiceArray.push(new InvoiceDataModel(invoice));
        });
        this.invoices = invoiceArray;
      }
    }
      this.loadingService.hideLoading();
    });
  }

  rowClicked(invoice: InvoiceDataModel): Promise<any> {
    if (invoice.entryType === 'AUTO') {
      return this.router.navigate([`/invoice/${invoice.falconInvoiceNumber}/AUTO`]);
    } else {
      return this.router.navigate([`/invoice/${invoice.falconInvoiceNumber}`]);
    }
  }

  sortChanged(sort: Sort): void {
    this.paginationModel.sortOrder = sort.direction;
    this.sortField = this.checkSortFields(sort.active);
    this.resetTable();
  }

  pageChanged(page: any): void {
    this.paginationModel.pageIndex = page.pageIndex + 1;
    this.paginationModel.numberPerPage = page.pageSize;
    this.getTableData(this.paginationModel.numberPerPage);
  }

  searchInvoices(searchValue: any): void {
    // this.totalSearchResult = -1; // this is for test
    this.searchValue = searchValue;
    console.log(this.searchValue);
    this.sortField = '';
    this.resetTable(true);
  }

  changeCreatedByUser(): void {
    this.createdByUser = !this.createdByUser;
    this.sortField = '';
    this.resetTable();
  }

  changeInvoiceStatus(statuses: Array<StatusModel>): void {
    this.selectedInvoiceStatuses = statuses.map(status => status.key);
    this.sortField = '';
    this.resetTable();
  }

  openFilter(): void {
    this.invoiceFilter = this.dialog.open(InvoiceFilterModalComponent, {
      minWidth: '525px',
      width: '33vw',
      autoFocus: false,
      position: {
        right: '24px'
      }
    });
    this.invoiceFilter.componentInstance.invoiceStatuses = this.invoiceStatuses;
    this.invoiceFilter.afterClosed().subscribe(response => {
      if (response) {
        this.resetTable();
      }
    });
  }

  resetTable(isInvoiceSearched = false): void {
    if (this.paginationModel.pageIndex !== 1) {
      this.dataTable.goToFirstPage();
    } else {
      this.getTableData(this.paginationModel.numberPerPage, isInvoiceSearched);
    }
  }

  routeToExtractPage(): void {
    this.router.navigate(['/invoice-extraction']);
  }

  checkSortFields(field: string): string {
    switch (field) {
      case 'statusLabel':
        return 'status';
      case 'invoiceReference':
        return 'tripId';
      case 'carrierDisplay':
        return 'carrier.scac';
      case 'carrierModeDisplay':
        return 'mode.mode';
      case 'paymentDueDisplay':
        return 'paymentDue';
      default:
        return field;
    }
  }

}
