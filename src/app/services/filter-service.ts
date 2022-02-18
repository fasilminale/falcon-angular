import {Injectable, OnDestroy} from '@angular/core';
import {FiltersModel} from '../models/filters/filters-model';
import {WebServices} from './web-services';
import {environment} from '../../environments/environment';
import {StatusModel} from '../models/invoice/status-model';
import {Subscription} from 'rxjs';

@Injectable()
export class FilterService implements OnDestroy {
  invoiceFilterModel: FiltersModel = new FiltersModel();
  invoiceStatuses: Array<StatusModel> = [];
  invoiceStatusSubscription: Subscription;
  constructor(private webService: WebServices) {
    this.invoiceStatusSubscription = this.webService.httpGet(`${environment.baseServiceUrl}/v1/invoiceStatuses`)
      .subscribe((invoiceStatuses: Array<StatusModel>) => {
        this.invoiceStatuses = invoiceStatuses;
      });
  }

  ngOnDestroy(): void {
    this.invoiceStatusSubscription.unsubscribe();
  }
}
