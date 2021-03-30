import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
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
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private webservice: WebServices
  ) {
  }

  ngOnInit(): void {
    this.getTableData(this.paginationModel.numberPerPage);
  }

  getTableData(numberPerPage: number): void {
    this.loadingService.showLoading();
    this.webservice.httpPost(`${environment.baseServiceUrl}/v1/invoices`, {
      page: this.paginationModel.pageIndex,
      sortField: this.sortField,
      sortOrder: this.paginationModel.sortOrder,
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
    if (this.paginationModel.pageIndex !== 1) {
      this.dataTable.goToFirstPage();
    } else {
      this.getTableData(this.paginationModel.numberPerPage);
    }
  }

  pageChanged(page: any): void {
    this.paginationModel.pageIndex = page.pageIndex + 1;
    this.paginationModel.numberPerPage = page.pageSize;
    this.getTableData(this.paginationModel.numberPerPage);
  }

}
