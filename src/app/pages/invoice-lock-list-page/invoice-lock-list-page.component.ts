import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {PaginationModel} from '../../models/PaginationModel';
import {DataTableComponent, ElmDataTableHeader, ModalService, ToastService} from '@elm/elm-styleguide-ui';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {Observable, Subscription} from 'rxjs';
import {SearchComponent} from '../../components/search/search.component';
import {UntypedFormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingService} from '../../services/loading-service';
import {WebServices} from '../../services/web-services';
import {FilterService} from '../../services/filter-service';
import {UserService} from '../../services/user-service';
import {environment} from '../../../environments/environment';
import {Sort} from '@angular/material/sort';
import { SubjectValue } from 'src/app/utils/subject-value';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-invoice-lock-list-page',
  templateUrl: './invoice-lock-list-page.component.html',
  styleUrls: ['./invoice-lock-list-page.component.scss']
})
export class InvoiceLockListPageComponent implements OnInit, OnDestroy {

  userInfo: UserInfoModel | undefined;
  public paginationModel: PaginationModel = new PaginationModel();
  public headers: Array<ElmDataTableHeader> = [
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
  public invoices: Array<InvoiceDataModel> = [];
  public unlockInvoices: Array<String> = [];
  searchValue = '';
  public createdByUser = false;
  private totalSearchResult = 0;
  private subscription: Subscription = new Subscription();
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  public isResetTableData$ = new SubjectValue<boolean>(false);

  controlGroup: UntypedFormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private webservice: WebServices,
    private util: UtilService,
    public filterService: FilterService,
    public userService: UserService,
    private modalService: ModalService,
    public toastService: ToastService,
  ) {
    this.controlGroup = userService.controlGroupState;
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
    });
    this.isResetTableData$.asObservable().subscribe((value: boolean) => {
      if (value) {
        this.resetTable();
      }
    });
  }

  ngOnDestroy(): void {
    this.userService.searchState = this.paginationModel;
    this.userService.controlGroupState = this.controlGroup;
    this.subscription.unsubscribe();
  }

  getTableData(numberPerPage: number): void {
    this.loadingService.showLoading('Loading');
    console.log({
      page: this.paginationModel.pageIndex,
      sortField: this.paginationModel.sortField ? this.paginationModel.sortField : 'falconInvoiceNumber',
      sortOrder: this.paginationModel.sortOrder ? this.paginationModel.sortOrder : 'desc',
      searchValue: this.searchValue,
      createdByUser: this.createdByUser,
      numberPerPage
    });
    this.webservice.httpPost(`${environment.baseServiceUrl}/v1/invoices/locked`, {
      page: this.paginationModel.pageIndex,
      sortField: this.paginationModel.sortField ? this.paginationModel.sortField : 'falconInvoiceNumber',
      sortOrder: this.paginationModel.sortOrder ? this.paginationModel.sortOrder : 'desc',
      searchValue: this.searchValue,
      createdByUser: this.createdByUser,
      numberPerPage
    }).subscribe((invoiceData: any) => {
      this.paginationModel.total = invoiceData.total;
      this.totalSearchResult = invoiceData.total;
      if (this.totalSearchResult && this.totalSearchResult !== 0) {
        const invoiceArray: Array<InvoiceDataModel> = [];
        invoiceData.data.map((invoice: any) => {
          invoiceArray.push(new InvoiceDataModel(invoice));
        });
        this.invoices = invoiceArray;
      } else {
        this.invoices = [];
      }
      this.loadingService.hideLoading();
    });
  }

  get invoiceCountLabel(): string {
    return `Locked Invoices (${this.paginationModel.total})`;
  }

  public rowClicked(invoice: InvoiceDataModel): Promise<boolean> {
    if (invoice.entryType === 'AUTO') {
      return this.router.navigate([`/invoice/${invoice.falconInvoiceNumber}/AUTO`]);
    } else {
      return this.router.navigate([`/invoice/${invoice.falconInvoiceNumber}`]);
    }
  }

  public rowSelected(invoiceArray: Array<InvoiceDataModel>) {
    this.unlockInvoices = invoiceArray.map(inv => inv.falconInvoiceNumber);
  }

  public confirmUnlockInvoices(): Observable<boolean> {
    return this.util.openConfirmationModal({
      title: 'Warning!',
      innerHtmlMessage: `Are you sure you want to Unlock the selected invoice(s)?
                  This can not be undone.`,
      confirmButtonText: 'YES, UNLOCK',
      cancelButtonText: 'CANCEL'
    });
  }

  public unlockSelectedInvoices() {
    this.confirmUnlockInvoices().subscribe(result => {
      if (result) {
        this.loadingService.showLoading('Loading');
        this.webservice.httpPost(`${environment.baseServiceUrl}/v1/invoices/lock/delete`, {
          invoiceNumbers: this.unlockInvoices
        }).subscribe((response: any) => {
          if (response['message'] === 'SUCCESS') {
            this.toastService.openSuccessToast(`Success! Selected Falcon Invoices unlocked.`, 5 * 1000);
            this.isResetTableData$.value = true;
          } else {
            this.toastService.openErrorToast(`Error! Unlocking Falcon invoices failed.`, 5 * 1000);
            this.loadingService.hideLoading();
            this.isResetTableData$.value = false;
          }
        });
      }
    });
  }

  public sortChanged(sort: Sort): void {
    this.paginationModel.sortOrder = sort.direction;
    this.paginationModel.sortField = this.checkSortFields(sort.active);
    this.resetTable();
  }

  public pageChanged(page: any): void {
    this.paginationModel.pageIndex = page.pageIndex + 1;
    this.paginationModel.numberPerPage = page.pageSize;
    this.getTableData(this.paginationModel.numberPerPage);
  }

  public resetTable(): void {
    if (this.paginationModel.pageIndex !== 1) {
      this.dataTable.goToFirstPage();
    } else {
      this.getTableData(this.paginationModel.numberPerPage);
    }
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
