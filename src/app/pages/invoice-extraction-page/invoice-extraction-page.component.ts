import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PaginationModel} from '../../models/PaginationModel';
import {LoadingService} from '../../services/loading-service';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {DataTableComponent} from '@elm/elm-styleguide-ui';
import {StatusModel} from '../../models/invoice/status-model';
import {MatDialog} from '@angular/material/dialog';
import {InvoiceFilterModalComponent} from '../../components/invoice-filter-modal/invoice-filter-modal.component';
import {FilterService} from '../../services/filter-service';

@Component({
  selector: 'app-invoice-extraction-page',
  templateUrl: './invoice-extraction-page.component.html',
  styleUrls: ['./invoice-extraction-page.component.scss']
})
export class InvoiceExtractionPageComponent implements OnInit {
  paginationModel: PaginationModel = new PaginationModel();
  headers = InvoiceDataModel.invoiceTableHeaders;
  invoices: Array<InvoiceDataModel> = [];
  sortField = '';
  selectedInvoiceStatuses: Array<string> = [];
  invoiceCountLabel = 'Approved Invoices';
  selectedInvoiceToExtract: InvoiceDataModel[] = [];
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private webservice: WebServices,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public filterService: FilterService,
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
    this.webservice.httpPost(`${environment.baseServiceUrl}/v1/invoices`, {
      page: this.paginationModel.pageIndex,
      sortField: this.sortField ? this.sortField : 'falconInvoiceNumber',
      sortOrder: this.paginationModel.sortOrder ? this.paginationModel.sortOrder : 'desc',
      invoiceStatuses: ["PENDING_PAY"],
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

  //rowClicked(invoice: InvoiceDataModel): Promise<any> {
    //return this.router.navigate([`/invoice/${invoice.falconInvoiceNumber}`]);
  //}

  extract(): void{
    console.log("--------");
    console.log(this.selectedInvoiceToExtract);
  }

  sortChanged(sort: any): void {
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

  checkBoxes(): void {

  }

}
