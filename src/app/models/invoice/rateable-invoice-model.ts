import {Location} from '../location/location-model';
import {CarrierReference} from '../master-data-models/carrier-model';
import {CarrierModeCodeReference} from '../master-data-models/carrier-mode-code-model';
import {CostLineItem} from '../line-item/line-item-model';

export interface RateableInvoiceModel {
  origin: Location;
  destination: Location;
  carrier?: CarrierReference;
  mode?: CarrierModeCodeReference;
  costLineItems: Array<CostLineItem>;
}
