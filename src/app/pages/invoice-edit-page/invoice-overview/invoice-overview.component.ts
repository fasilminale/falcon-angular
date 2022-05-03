import { Component, Inject, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InvoiceOverviewDetail } from 'src/app/models/invoice/invoice-overview-detail.model';
import { SubscriptionManager, SUBSCRIPTION_MANAGER } from 'src/app/services/subscription-manager';
import {RemitHistoryItem} from "../../../models/invoice/remit-history-item";

@Component({
  selector: 'app-invoice-overview',
  templateUrl: './invoice-overview.component.html',
  styleUrls: ['./invoice-overview.component.scss']
})
export class InvoiceOverviewComponent implements OnInit {

  @Input() set loadInvoiceOverviewDetail$(observable: Observable<InvoiceOverviewDetail>) {
    this.subscriptionManager.manage(observable.subscribe(
      invoiceOverviewDetail => {
        this.invoiceOverviewDetail = invoiceOverviewDetail
        this.formatRemitData(this.invoiceOverviewDetail.remitHistory ?? [])
      }
    ));
  }
  invoiceOverviewDetail: InvoiceOverviewDetail = {};
  erpInvoiceNumbers: string[] = [];
  erpRemittanceNumbers: string[] = [];
  vendorIds: string[] = [];
  amountOfPayments: string[] = [];
  dateOfPayments: string[] = [];

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) { }

  ngOnInit(): void {
  }

  formatRemitData(remitData: RemitHistoryItem[]): void {

    this.erpInvoiceNumbers = [];
    this.erpRemittanceNumbers = [];
    this.vendorIds = [];
    this.amountOfPayments = [];
    this.dateOfPayments = [];

    if (remitData.length === 0) {
      this.erpInvoiceNumbers.push('N/A');
      this.erpRemittanceNumbers.push('N/A');
      this.vendorIds.push('N/A');
      this.amountOfPayments.push('N/A');
      this.dateOfPayments.push('N/A');
    }
    else {
      remitData.forEach((item) => {
        this.erpInvoiceNumbers.push(item.erpInvoiceNumber);
        this.erpRemittanceNumbers.push(item.erpRemittanceNumber);
        this.vendorIds.push(item.remitVendorId)
        const amountOfPaymentString = item.amountOfPayment ? item.amountOfPayment + '' : undefined;
        this.amountOfPayments.push(amountOfPaymentString ?? 'N/A')
        this.dateOfPayments.push(item.dateOfPayment ?? 'N/A')
      })
    }
  }



}
