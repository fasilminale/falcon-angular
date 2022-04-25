import {CarrierReference} from "../master-data-models/carrier-model";
import {CarrierModeCodeReference} from "../master-data-models/carrier-mode-code-model";
import {ServiceLevel} from "../master-data-models/service-level-model";

export interface EditAutoInvoiceModel {

  carrier?: CarrierReference;
  mode?: CarrierModeCodeReference;
  serviceLevel?: ServiceLevel;
  pickupDateTime?: string
}
