import {Injectable} from '@angular/core';
import {FiltersModel} from '../models/filters/filters-model';

@Injectable()
export class FilterService {
  invoiceFilterModel: FiltersModel = new FiltersModel();
  constructor() {}
}
