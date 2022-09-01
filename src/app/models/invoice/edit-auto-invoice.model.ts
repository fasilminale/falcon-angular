import {CarrierReference} from '../master-data-models/carrier-model';
import {CarrierModeCodeReference} from '../master-data-models/carrier-mode-code-model';
import {ServiceLevel} from '../master-data-models/service-level-model';
import {GlLineItem} from '../line-item/line-item-model';
import {CostLineItem, DisputeLineItem} from '../line-item/line-item-model';
import {FreightOrder} from './freight-model';
import {BillToLocation, Location} from '../location/location-model';
import {WeightAdjustment} from './trip-information-model';

export interface EditAutoInvoiceModel {
  amountOfInvoice: number;
  totalGrossWeight?: number;
  originalTotalGrossWeight?: number;
  weightAdjustments?: Array<WeightAdjustment>;
  freightOrders?: Array<FreightOrder>;
  carrier?: CarrierReference;
  mode?: CarrierModeCodeReference;
  serviceLevel?: ServiceLevel;
  pickupDateTime?: string;
  glLineItemList?: Array<GlLineItem>;
  costLineItems?: Array<CostLineItem>;
  pendingChargeLineItems?: Array<CostLineItem>;
  disputeLineItems?: Array<DisputeLineItem>;
  deniedChargeLineItems?: Array<CostLineItem>;
  deletedChargeLineItems?: Array<CostLineItem>;
  originAddress?: Location;
  destinationAddress?: Location;
  billToAddress?: BillToLocation;
  shippingPoint?: string;
  businessUnit?: string;
  hasRateEngineError?: boolean;
}
