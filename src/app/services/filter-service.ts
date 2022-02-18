import {Injectable} from '@angular/core';
import {FiltersModel} from '../models/filters/filters-model';
import {WebServices} from './web-services';
import {environment} from '../../environments/environment';
import {StatusModel} from '../models/invoice/status-model';

@Injectable()
export class FilterService {
  invoiceFilterModel: FiltersModel = new FiltersModel();
  invoiceStatuses: Array<StatusModel> = [];
  constructor(private webService: WebServices) {
    this.webService.httpGet(`${environment.baseServiceUrl}/v1/invoiceStatuses`).subscribe((invoiceStatuses: Array<StatusModel>) => {
      this.invoiceStatuses = invoiceStatuses;
    });
  }
}
