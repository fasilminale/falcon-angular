import {CarrierReference} from "../master-data-models/carrier-model";
import {CarrierModeCodeReference} from "../master-data-models/carrier-mode-code-model";
import {ServiceLevel} from "../master-data-models/service-level-model";
import {CostLineItem} from "../line-item/line-item-model";

export interface EditAutoInvoiceModel {

  carrier?: CarrierReference;
  mode?: CarrierModeCodeReference;
  serviceLevel?: ServiceLevel;
  pickupDateTime?: string;
  costLineItems: Array<CostLineItem>;
  pendingChargeLineItems: Array<CostLineItem>;
}
