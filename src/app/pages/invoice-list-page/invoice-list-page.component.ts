import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
import {PaginationModel} from '../../models/PaginationModel';
import {LoadingService} from '../../services/loading-service';
import {InvoiceDataModel, InvoiceUtils} from '../../models/invoice/invoice-model';
import {ConfirmationModalComponent, DataTableComponent, ElmDataTableHeader, ModalService, ToastService} from '@elm/elm-styleguide-ui';
import {StatusModel} from '../../models/invoice/status-model';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {InvoiceFilterModalComponent} from '../../components/invoice-filter-modal/invoice-filter-modal.component';
import {FilterService} from '../../services/filter-service';
import {Sort} from '@angular/material/sort';
import {ElmUamPermission} from '../../utils/elm-uam-permission';
import {UserService} from '../../services/user-service';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {SelectOption} from 'src/app/models/select-option-model/select-option-model';
import {InvoiceService} from 'src/app/services/invoice-service';
import {Subscription} from 'rxjs';
import {SearchComponent} from '../../components/search/search.component';
import {UntypedFormGroup} from '@angular/forms';
import {UtilService} from '../../services/util-service';


const {ALLOW_MANAGE_INVOICE_LOCKS, ALLOW_INVOICE_WRITE} = ElmUamPermission;

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
    {header: 'falconInvoiceNumber', label: 'Falcon Invoice #'},
    {header: 'invoiceReference', label: 'Invoice Reference'},
    {header: 'billOfLadingNumber', label: 'BOL #'},
    {header: 'carrierDisplay', label: 'Carrier'},
    {header: 'carrierModeDisplay', label: 'Carrier Mode'},
    {header: 'businessUnit', label: 'Business Unit'},
    {header: 'originStr', label: 'Origin'},
    {header: 'destinationStr', label: 'Destination'},
    {header: 'invoiceDate', label: 'Invoice Date'},
    {header: 'paymentDueDisplay', label: 'Payment Due'},
    {header: 'lastPaidDate', label: 'Payment Date'},
    {header: 'amountOfInvoice', label: 'Amount', alignment: 'end'},
    {header: 'currency', label: 'Currency'},
  ];
  invoices: Array<InvoiceDataModel> = [];
  searchValue = '';
  createdByUser = false;
  totalSearchResult = 0;
  selectedInvoiceStatuses: Array<string> = [];
  invoiceCountLabel = 'Invoices';
  subscription: Subscription = new Subscription();
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;
  @ViewChild(SearchComponent) searchComponent!: SearchComponent;

  invoiceFilter!: MatDialogRef<any>;
  invoiceStatuses: Array<StatusModel> = [];
  public originCities: Array<SelectOption<string>> = [];
  public destinationCities: Array<SelectOption<string>> = [];
  public masterDataScacs: Array<SelectOption<string>> = [];
  public masterDataShippingPoints: Array<SelectOption<string>> = [];
  public masterDataModes: Array<SelectOption<string>> = [];

  controlGroup: UntypedFormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private webservice: WebServices,
    private dialog: MatDialog,
    public filterService: FilterService,
    public userService: UserService,
    private modalService: ModalService,
    private toastService: ToastService,
    private invoiceService: InvoiceService,
    private utilService: UtilService
  ) {
    this.controlGroup = userService.controlGroupState;
  }

  ngOnInit(): void {
    this.paginationModel = this.userService.searchState;
    this.searchValue = this.userService.controlGroupState.controls.control.value ?? '';
    const search = this.searchValue.length > 0;
    this.getTableData(this.paginationModel.numberPerPage, search);
    this.route.queryParamMap.subscribe(queryParams => {
      const falconInvoiceNumber = queryParams.get('falconInvoiceNumber');
      if (falconInvoiceNumber) {
        this.toastService.openSuccessToast(`Success! Falcon Invoice ${falconInvoiceNumber} has been deleted.`, 5 * 1000);
      }
    });
    this.userService.getUserInfo().subscribe(userInfo => {
      this.userInfo = new UserInfoModel(userInfo);
    });
    this.invoiceService.getOriginDestinationCities()
      .subscribe(opts => {
        if (opts && opts.length > 0) {
          this.originCities = opts[0].originCities.map(InvoiceUtils.toOption);
          this.destinationCities = opts[0].destinationCities.map(InvoiceUtils.toOption);
        }
      });
    this.subscription.add(this.invoiceService.getMasterDataScacs().subscribe(
      opts => {
        if (opts && opts.length > 0) {
          this.masterDataScacs = opts.map(InvoiceUtils.toScacOption);
        }
      }
    ));
    this.subscription.add(this.invoiceService.getMasterDataShippingPoints().subscribe(
      opts => {
        if (opts && opts.length > 0) {
          this.masterDataShippingPoints = opts.map(InvoiceUtils.toShippingPointCode);
        }
      }
    ));
    this.subscription.add(this.invoiceService.getMasterDataModes().subscribe(
      opts => {
        if (opts && opts.length > 0) {
          this.masterDataModes = opts.map(InvoiceUtils.toModeOption);
        }
      }
    ));
  }

  ngOnDestroy(): void {
    this.userService.searchState = this.paginationModel;
    this.userService.controlGroupState = this.controlGroup;
    this.subscription.unsubscribe();
  }

  get canExtractInvoice(): boolean {
    return this.hasAllPermissions([ALLOW_INVOICE_WRITE]);
  }

  get canManageInvoiceLocks(): boolean {
    return this.hasAllPermissions([ALLOW_MANAGE_INVOICE_LOCKS]);
  }

  hasAllPermissions(permissions: Array<ElmUamPermission>): boolean {
    return this.userInfo?.hasAllPermissions(permissions) ?? false;
  }

  getTableData(numberPerPage: number, isInvoiceSearched = false): void {
    this.loadingService.showLoading('Loading');
    const searchFilters = this.filterService.invoiceFilterModel.formatForSearch();
    this.webservice.httpPost(`${environment.baseServiceUrl}/v1/invoices`, {
      page: this.paginationModel.pageIndex,
      sortField: this.paginationModel.sortField ? this.paginationModel.sortField : 'falconInvoiceNumber',
      sortOrder: this.paginationModel.sortOrder ? this.paginationModel.sortOrder : 'desc',
      searchValue: this.searchValue,
      createdByUser: this.createdByUser,
      ...searchFilters,
      numberPerPage
    }).subscribe((invoiceData: any) => {
      if (invoiceData?.data?.length === 1 && this.searchValue !== '') {
        this.controlGroup.controls.control.setValue('');
        this.rowClicked(invoiceData.data[0]);
      } else {
        this.paginationModel.total = invoiceData.total;
        this.totalSearchResult = invoiceData.total;
        if (!isInvoiceSearched || this.totalSearchResult !== 0) {
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
    this.paginationModel.sortField = this.checkSortFields(sort.active);
    this.resetTable();
  }

  pageChanged(page: any): void {
    this.paginationModel.pageIndex = page.pageIndex + 1;
    this.paginationModel.numberPerPage = page.pageSize;
    this.getTableData(this.paginationModel.numberPerPage);
  }

  searchInvoices(searchValue: any): void {
    // Clear filters
    this.filterService.invoiceFilterModel.resetForm();

    this.searchValue = searchValue;
    this.paginationModel.sortField = '';
    this.resetTable(true);
  }

  changeCreatedByUser(): void {
    this.createdByUser = !this.createdByUser;
    this.paginationModel.sortField = '';
    this.resetTable();
  }

  changeInvoiceStatus(statuses: Array<StatusModel>): void {
    this.selectedInvoiceStatuses = statuses.map(status => status.key);
    this.paginationModel.sortField = '';
    this.resetTable();
  }

  openFilter(): void {
    this.invoiceFilter = this.dialog.open(InvoiceFilterModalComponent, {
      data: {
        originCities: this.originCities,
        destinationCities: this.destinationCities,
        masterDataScacs: this.masterDataScacs,
        masterDataShippingPoints: this.masterDataShippingPoints,
        masterDataModes: this.masterDataModes,
      },
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
        // Clear the search control
        this.searchValue = '';
        this.searchComponent.clear();

        this.resetTable();
      }
    });
  }

  clearSearchFilter(): void {
    this.searchValue = '';
    this.searchComponent.clear();
    this.resetTable();
  }

  resetTable(isInvoiceSearched = false): void {
    if (this.paginationModel.pageIndex !== 1) {
      this.dataTable.goToFirstPage();
    } else {
      this.getTableData(this.paginationModel.numberPerPage, isInvoiceSearched);
    }
  }

  async routeToExtractPage(): Promise<boolean> {
    return this.router.navigate(['/invoice-extraction']);
  }

  async routeToManageInvoiceLocksPage(): Promise<boolean> {
    return this.router.navigate(['/manage-invoice-locks']);
  }

  downloadCsv(): void {
    const filters: any = this.filterService.invoiceFilterModel.formatForSearch();
    if (filters.invoiceStatuses.length === 0) {
      this.dialog.open(ConfirmationModalComponent,
        {
          autoFocus: false,
          data: {
            title: 'Download List',
            innerHtmlMessage: `You are about to download a list of ${this.paginationModel.total} invoices.
                   <br/><br/><strong>Are you sure you want to download these invoices?</strong>`,
            confirmButtonText: 'Download List',
            confirmButtonStyle: 'primary',
            cancelButtonText: 'Cancel'
          }
        })
        .afterClosed()
        .subscribe(result => {
          if (result) {
            this.callCSVApi({page: 1, numberPerPage: this.paginationModel.total});
          }
        });
    } else {
      this.callCSVApi({page: 1, numberPerPage: this.paginationModel.total});
    }

  }

  callCSVApi(pageData: object): void {
    this.utilService.downloadCsv('Falcon.Invoice.List.csv', `${environment.baseServiceUrl}/v1/invoices/csvData`, {
      ...pageData,
      sortField: this.paginationModel.sortField ? this.paginationModel.sortField : 'falconInvoiceNumber',
      sortOrder: this.paginationModel.sortOrder ? this.paginationModel.sortOrder : 'desc',
      searchValue: this.searchValue,
      createdByUser: this.createdByUser,
      ...this.filterService.invoiceFilterModel.formatForSearch()
    });
  }

  checkSortFields(field: string): string {
    switch (field) {
      case 'statusLabel':
        return 'status';
      case 'carrierDisplay':
        return 'carrier.name';
      case 'carrierModeDisplay':
        return 'mode.mode';
      case 'paymentDueDisplay':
        return 'paymentDue';
      case 'lastPaidDate':
        return 'lastPaidDate';
      case 'originStr':
        return 'origin.city';
      case 'destinationStr':
        return 'destination.city';
      default:
        return field;
    }
  }
}
