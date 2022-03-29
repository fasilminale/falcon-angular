import { Component, Inject, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InvoiceOverviewDetail } from 'src/app/models/invoice/invoice-overview-detail.model';
import { SubscriptionManager, SUBSCRIPTION_MANAGER } from 'src/app/services/subscription-manager';

@Component({
  selector: 'app-invoice-overview',
  templateUrl: './invoice-overview.component.html',
  styleUrls: ['./invoice-overview.component.scss']
})
export class InvoiceOverviewComponent implements OnInit {

  @Input() set loadInvoiceOverviewDetail$(observable: Observable<InvoiceOverviewDetail>) {
    this.subscriptionManager.manage(observable.subscribe(
      invoiceOverviewDetail => this.invoiceOverviewDetail = invoiceOverviewDetail
    ));
  }
  invoiceOverviewDetail: InvoiceOverviewDetail = {};

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) { }

  ngOnInit(): void {
  }

}
