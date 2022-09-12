import {Injectable, OnDestroy} from '@angular/core';
import { FiltersModel} from '../models/filters/filters-model';
import {WebServices} from './web-services';
import {environment} from '../../environments/environment';
import {Subscription} from 'rxjs';
import { InvoiceService } from './invoice-service';
import { InvoiceUtils } from '../models/invoice/invoice-model';
import { StatusModel } from '../models/invoice/status-model';
import { KeyedLabel } from '../models/generic/keyed-label';

@Injectable()
export class FilterService implements OnDestroy {
  invoiceFilterModel: FiltersModel = new FiltersModel();
  invoiceStatuses: Array<StatusModel> = [];
  invoiceStatusSubscription: Subscription;

  carrierScacs: Array<KeyedLabel> = [];
  carrierScacsSubscription: Subscription;
  constructor(private webService: WebServices, private invoiceService: InvoiceService) {
    this.invoiceStatusSubscription = this.webService.httpGet(`${environment.baseServiceUrl}/v1/invoiceStatuses`)
      .subscribe((invoiceStatuses: Array<StatusModel>) => {
        this.invoiceStatuses = invoiceStatuses;
      });
    this.carrierScacsSubscription = this.invoiceService.getMasterDataScacs()
      .subscribe(opts => {
        if(opts && opts.length > 0) {
          this.carrierScacs = opts.map(InvoiceUtils.toScacFilterOption);
        }
      });
  }

  ngOnDestroy(): void {
    this.invoiceStatusSubscription.unsubscribe();
    this.carrierScacsSubscription.unsubscribe();
  }
}
