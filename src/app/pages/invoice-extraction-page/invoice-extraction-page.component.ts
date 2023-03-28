import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PaginationModel} from '../../models/PaginationModel';
import {LoadingService} from '../../services/loading-service';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {
  ButtonClickedEvent,
  DataTableComponent,
  ElmDataTableHeader
} from '@elm/elm-styleguide-ui';
import {MatDialog} from '@angular/material/dialog';
import {FilterService} from '../../services/filter-service';
import {InvoiceService} from '../../services/invoice-service';
import {UtilService} from "../../services/util-service";
import {WindowService} from "../../services/window-service/window-service";
import {Sort} from '@angular/material/sort';


@Component({
  selector: 'app-invoice-extraction-page',
  templateUrl: './invoice-extraction-page.component.html',
  styleUrls: ['./invoice-extraction-page.component.scss']
})
export class InvoiceExtractionPageComponent implements OnInit {
  paginationModel: PaginationModel = new PaginationModel();
  headers: Array<ElmDataTableHeader> = [
    {header: 'statusLabel', label: 'Status'},
    {header: 'falconInvoiceNumber', label: 'Falcon Invoice Number', alignment: 'center', button: true, buttonStyle: 'link'},
    {header: 'invoiceReference', label: 'Invoice Reference'},
    {header: 'carrierDisplay', label: 'Carrier'},
    {header: 'carrierModeDisplay', label: 'Carrier Mode', alignment: 'center'},
    {header: 'businessUnit', label: 'Business Unit', alignment: 'center'},
    {header: 'amountOfInvoice', label: 'Invoice Amount', alignment: 'end'},
    {header: 'currency', label: 'Currency'},
    {header: 'invoiceDate', label: 'Invoice Date'},
    {header: 'createdBy', label: 'Created By'},
    {header: 'standardPaymentTermsOverride', label: 'Override'}
  ];
  invoices: Array<InvoiceDataModel> = [];
  sortField = '';
  selectedInvoiceStatuses: Array<string> = [];
  invoiceCountLabel = 'Approved Invoices';
  selectedInvoicesToExtract: InvoiceDataModel[] = [];
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private webService: WebServices,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public filterService: FilterService,
    private invoiceService: InvoiceService,
    private utilService: UtilService,
    private windowService: WindowService
  ) {
  }

  ngOnInit(): void {
    this.getTableData(this.paginationModel.numberPerPage);
    this.route.queryParamMap.subscribe(queryParams => {
      const falconInvoiceNumber = queryParams.get('falconInvoiceNumber');
    });
  }

  getTableData(numberPerPage: number): void {
    this.loadingService.showLoading('Loading');
    const searchFilters = this.filterService.invoiceFilterModel.formatForSearch();
    this.webService.httpPost(`${environment.baseServiceUrl}/v1/invoices`, {
      page: this.paginationModel.pageIndex,
      sortField: this.sortField ? this.sortField : 'falconInvoiceNumber',
      sortOrder: this.paginationModel.sortOrder ? this.paginationModel.sortOrder : 'desc',
      invoiceStatuses: ["APPROVED"],
      numberPerPage
    }).subscribe((invoiceData: any) => {
      this.paginationModel.total = invoiceData.total;
      this.invoiceCountLabel = `Approved Invoices (${this.paginationModel.total})`;
      const invoiceArray: Array<InvoiceDataModel> = [];
      invoiceData.data.map((invoice: any) => {
        invoiceArray.push(new InvoiceDataModel(invoice));
      });
      this.invoices = invoiceArray;
      this.loadingService.hideLoading();
    });
  }

  buttonClicked(event : ButtonClickedEvent): void {
    if (event.rowData.entryType === 'AUTO') {
      this.windowService.openInNewWindow(`invoice/${event.rowData.falconInvoiceNumber}/AUTO`);
    } else {
      this.windowService.openInNewWindow(`invoice/${event.rowData.falconInvoiceNumber}`);
    }
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

  resetTable(): void {
    if (this.paginationModel.pageIndex !== 1) {
      this.dataTable.goToFirstPage();
    } else {
      this.getTableData(this.paginationModel.numberPerPage);
    }
  }

  private showSuccess(){
    this.snackBar.open(`Success! All Invoices have been extracted for remittance.`, 'close', {duration: 5 * 1000});
    this.getTableData(this.paginationModel.numberPerPage);
  }

  public async extract(): Promise<void> {
    if(this.selectedInvoicesToExtract.length < 1){
      return;
    }
    const dialogResult = await this.utilService.openConfirmationModal(
        {
          title: 'Extract Invoice(s)',
          innerHtmlMessage: `You are about to extract ${this.selectedInvoicesToExtract.length} Invoice(s) for remittance.
                   <br/><br/><strong>This action cannot be undone.</strong>`,
          confirmButtonText: 'Extract Invoice(s)',
          cancelButtonText: 'Cancel'
        }
      ).toPromise();

      if(dialogResult) {
        const promises = this.selectedInvoicesToExtract.map(
          invoice => this.invoiceService.extract(invoice.falconInvoiceNumber).toPromise());

        Promise.all(promises).then(result => (this.showSuccess()));
      }
  }

}
