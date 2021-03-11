import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
import {Invoice, INVOICE_FIELDS} from '../../models/invoice/invoice-model';
import {PaginationModel} from '../../models/PaginationModel';
import {LoadingService} from '../../services/loading-service';

@Component({
  selector: 'app-invoice-list-page',
  templateUrl: './invoice-list-page.component.html',
  styleUrls: ['./invoice-list-page.component.scss']
})
export class InvoiceListPageComponent implements OnInit {
  paginationModel: PaginationModel = new PaginationModel();
  headers = INVOICE_FIELDS;
  invoices: Array<any> = [];

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
      numberPerPage
    }).subscribe((invoiceData: any) => {
      this.paginationModel.total = invoiceData.total;
      const invoiceArray: Array<Invoice> = [];
      invoiceData.data.map((invoice: any) => {
        invoiceArray.push(invoice);
      });
      this.invoices = invoiceArray;
      this.loadingService.hideLoading();
    });
  }

  rowClicked(invoice: Invoice): Promise<boolean> {
    // eventually, we will want to go to a details page from here
    return Promise.resolve(false);
  }

  pageChanged(page: any): void {
    this.paginationModel.pageIndex = page.pageIndex + 1;
    this.paginationModel.numberPerPage = page.pageSize;
    this.getTableData(this.paginationModel.numberPerPage);
  }

}
