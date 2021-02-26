import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
import {Invoice, INVOICE_FIELDS, isInvoice} from '../../models/invoice-model';
import {PageEvent} from '@angular/material/paginator';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-invoice-list-page',
  templateUrl: './invoice-list-page.component.html',
  styleUrls: ['./invoice-list-page.component.scss']
})
export class InvoiceListPageComponent implements OnInit {
  invoices: Array<Invoice> = [];
  headers = INVOICE_FIELDS;
  paginationModel = {
    total: 0,
    pageSizes: [0]
  };

  constructor(
    private router: Router,
    private webservice: WebServices
  ) {
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.webservice
      .httpGet<Array<Invoice>>(`${environment.baseServiceUrl}/v1/invoices`)
      .subscribe(
        (invoices: Array<Invoice>) => {
          this.invoices = invoices.filter(isInvoice);
        },
        (error: HttpErrorResponse) => {
          this.invoices = [];
        })
      .add(() => {
        this.paginationModel.total = this.invoices.length;
        this.paginationModel.pageSizes = [this.invoices.length];
      });
  }

  rowClicked(invoice: Invoice): Promise<boolean> {
    // eventually, we will want to go to a details page from here
    return Promise.resolve(false);
  }

  pageChanged(page: PageEvent): void {
  }

}
