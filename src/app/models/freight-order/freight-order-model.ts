import {Measurement} from '../measurement/measurement-model';
import {FreightOrderLineItem} from '../line-item/line-item-model';

export interface FreightOrder {
  accountGroup: string;
  billOfLadingNumber: string;
  carrierModeCode: string;
  createDateTime: string;
  customerPurchaseOrders: Array<string>;
  customerSalesOrders: Array<string>;
  sapDeliveryInstructions: Array<string>;
  deliveryInstructions: Array<string>;
  deliveryQty: Measurement;
  deliverydatetime: string;
  sapDeliveryType: string;
  destination: Location;
  erpDeliveryNumber: string;
  freightOrderId: string;
  freightOrderStatus: string;
  sapFreightPaymentTerms: string;
  freightPaymentTerms: string;
  incoTerms1: string;
  incoTerms2: string;
  lineItems: Array<FreightOrderLineItem>;
  volumeGross: Measurement;
  volumeNet: Measurement;
  weightGross: Measurement;
  weightNet: Measurement;
  caseCount: number;
  meansOfTransportId: string;
  origin: Location;
  originalDeliveryReference: string;
  proofOfDeliveryDate: string;
  routeSchedule: string;
  routePlan: RoutePlan;
  scac: string;
  shipDate: string;
  shippingConditions: string;
  shippingPoint: string;
  shippingPointTimeZone: string;
  shippingUnitPlanned: Measurement;
  shippingUnitActual: Measurement;
  shipToPartyNumber: string;
  shipVia: string;
  shipViaAir: string;
  soCreateDateTime: string;
  soldToNumber: string;
  storageCodes: string;
  stopId: string;
  threePLSalesOrder: string;
  tmsLoadId: string;
  trackingNumbers: string;
  isEdit?: boolean;
  palletCount: number;
  hasWeightError?: boolean;
}

export interface RoutePlan {
  scacDayValue1: string;
  scacDayValue2: string;
  scacDayValue3: string;
  scacDayValue4: string;
  scacDayValue5: string;
  scacDayValue6: string;
  scacDayValue7: string;
  itineraryDayValue1: string;
  itineraryDayValue2: string;
  itineraryDayValue3: string;
  itineraryDayValue4: string;
  itineraryDayValue5: string;
  itineraryDayValue6: string;
  itineraryDayValue7: string;
}
