import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PaginationModel} from '../../models/PaginationModel';
import {LoadingService} from '../../services/loading-service';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {DataTableComponent, ElmDataTableHeader} from '@elm/elm-styleguide-ui';
import {StatusModel} from '../../models/invoice/status-model';
import {MatDialog} from '@angular/material/dialog';
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
export class InvoiceListPageComponent implements OnInit {
  public userInfo: UserInfoModel | undefined;
  paginationModel: PaginationModel = new PaginationModel();
  headers: Array<ElmDataTableHeader> =   [
    {header: 'statusLabel', label: 'Status'},
    {header: 'falconInvoiceNumber', label: 'Falcon Invoice Number', alignment: 'end'},
    {header: 'externalInvoiceNumber', label: 'External Invoice Number', alignment: 'end'},
    {header: 'amountOfInvoice', label: 'Invoice Amount', alignment: 'end'},
    {header: 'currency', label: 'Currency'},
    {header: 'vendorNumber', label: 'Vendor Number', alignment: 'end'},
    {header: 'invoiceDate', label: 'Invoice Date'},
    {header: 'createdBy', label: 'Created By'},
    {header: 'companyCode', label: 'Company Code', alignment: 'end'},
    {header: 'standardPaymentTermsOverride', label: 'Override'}
  ];
  invoices: Array<InvoiceDataModel> = [];
  sortField = '';
  searchValue = '';
  createdByUser = false;
  selectedInvoiceStatuses: Array<string> = [];
  invoiceCountLabel = 'Invoices';
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  private readonly requiredPermissions = [ElmUamRoles.ALLOW_ALL_ACCESS, ElmUamRoles.ALLOW_INVOICE_WRITE];
  public hasInvoiceWrite = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private webservice: WebServices,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public filterService: FilterService,
    public userService: UserService
  ) {
  }

  ngOnInit(): void {
    this.getTableData(this.paginationModel.numberPerPage);
    this.route.queryParamMap.subscribe(queryParams => {
      const falconInvoiceNumber = queryParams.get('falconInvoiceNumber');
      if (falconInvoiceNumber) {
        this.snackBar.open(`Success! Falcon Invoice ${falconInvoiceNumber} has been deleted.`, 'close', {duration: 5 * 1000});
      }
    });
    this.userService.getUserInfo().subscribe(userInfo => {
      this.userInfo = new UserInfoModel(userInfo);
      this.hasInvoiceWrite = this.userInfo.hasPermission(this.requiredPermissions);;
    });
  }

  getTableData(numberPerPage: number): void {
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
      this.paginationModel.total = invoiceData.total;
      this.invoiceCountLabel = this.createdByUser ? `My Invoices (${this.paginationModel.total})` :
        (this.searchValue || this.selectedInvoiceStatuses.length > 0) ? `Invoices (${this.paginationModel.total})` :
          'Invoices';
      const invoiceArray: Array<InvoiceDataModel> = [];
      invoiceData.data.map((invoice: any) => {
        invoiceArray.push(new InvoiceDataModel(invoice));
      });
      this.invoices = invoiceArray;
      this.loadingService.hideLoading();
    });
  }

  rowClicked(invoice: InvoiceDataModel): Promise<any> {
    return this.router.navigate([`/invoice/${invoice.falconInvoiceNumber}`]);
  }

  sortChanged(sort: Sort): void {
    this.paginationModel.sortOrder = sort.direction;
    this.sortField = sort.active;
    this.resetTable();
  }

  pageChanged(page: any): void {
    this.paginationModel.pageIndex = page.pageIndex + 1;
    this.paginationModel.numberPerPage = page.pageSize;
    this.getTableData(this.paginationModel.numberPerPage);
  }

  searchInvoices(searchValue: any): void {
    this.searchValue = searchValue;
    this.sortField = '';
    this.resetTable();
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
    this.dialog.open(InvoiceFilterModalComponent, {
      minWidth: '525px',
      width: '33vw',
      autoFocus: false,
      position: {
        right: '24px'
      }
    }).afterClosed().subscribe( response => {
      if (response) {
        this.resetTable();
      }
    });
  }

  resetTable(): void {
    if (this.paginationModel.pageIndex !== 1) {
      this.dataTable.goToFirstPage();
    } else {
      this.getTableData(this.paginationModel.numberPerPage);
    }
  }

  routeToExtractPage(): void {
    this.router.navigate(['/invoice-extraction']);
  };

}
