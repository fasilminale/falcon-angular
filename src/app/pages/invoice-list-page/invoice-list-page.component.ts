import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {PaginationModel} from '../../models/PaginationModel';
import {LoadingService} from '../../services/loading-service';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {DataTableComponent} from '@elm/elm-styleguide-ui';

@Component({
  selector: 'app-invoice-list-page',
  templateUrl: './invoice-list-page.component.html',
  styleUrls: ['./invoice-list-page.component.scss']
})
export class InvoiceListPageComponent implements OnInit {
  paginationModel: PaginationModel = new PaginationModel();
  headers = InvoiceDataModel.invoiceTableHeaders;
  invoices: Array<InvoiceDataModel> = [];
  sortField = '';
  searchValue = '';
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private webservice: WebServices,
    private snackBar: MatSnackBar
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
  }

  getTableData(numberPerPage: number): void {
    this.loadingService.showLoading();
    this.webservice.httpPost(`${environment.baseServiceUrl}/v1/invoices`, {
      page: this.paginationModel.pageIndex,
      sortField: this.sortField,
      sortOrder: this.paginationModel.sortOrder,
      searchValue: this.searchValue,
      numberPerPage
    }).subscribe((invoiceData: any) => {
      this.paginationModel.total = invoiceData.total;
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

  searchInvoices(searchValue: any): void {
    this.searchValue = searchValue;
    this.resetTable();
  }

  private resetTable(): void {
    if (this.paginationModel.pageIndex !== 1) {
      this.dataTable.goToFirstPage();
    } else {
      this.getTableData(this.paginationModel.numberPerPage);
    }
  }
}
