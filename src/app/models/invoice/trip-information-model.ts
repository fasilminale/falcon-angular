import {CarrierReference} from '../master-data-models/carrier-model';
import {CarrierModeCodeReference} from '../master-data-models/carrier-mode-code-model';
import {ServiceLevel} from '../master-data-models/service-level-model';
import {BillToLocation, ShippingPointLocation} from '../location/location-model';
import {GlLineItem, GlLineItemError} from '../line-item/line-item-model';
import {FreightOrder} from '../freight-order/freight-order-model';

export interface TripInformation {
  tripId: string;
  vendorNumber: string;
  invoiceDate: Date;
  pickUpDate?: Date;
  createdDate?: Date;
  deliveryDate?: Date;
  proTrackingNumber: string;
  bolNumber: string;
  isBolNumberDuplicate?: boolean;
  duplicateBOLErrorMessage?: string;
  freightPaymentTerms: FreightPaymentTerms;
  carrier?: CarrierReference;
  carrierMode?: CarrierModeCodeReference;
  serviceLevel?: ServiceLevel;
  destinationType?: string;
  businessUnit?: string;
  originAddress?: ShippingPointLocation;
  destinationAddress?: ShippingPointLocation;
  billToAddress?: BillToLocation;
  freightOrders: FreightOrder[];
  overriddenDeliveryDateTime?: Date;
  assumedDeliveryDateTime?: Date;
  tripTenderTime?: Date;
  totalGrossWeight?: number;
  originalTotalGrossWeight?: number;
  weightAdjustments?: Array<WeightAdjustment>;
}

export interface WeightAdjustment {
  amount: number;
  customerCategory: string;
  freightClasses: Array<string>;
}

export interface InvoiceAllocationDetail {
  invoiceNetAmount: string;
  totalGlAmount: string;
  glLineItems: Array<GlLineItem>;
  glLineItemsErrors?: Array<GlLineItemError>;
  glLineItemsInvalid?: boolean;
}

export enum FreightPaymentTerms {
  PREPAID = 'Prepaid',
  COLLECT = 'Collect',
  THIRD_PARTY = 'Third Party'
}

export const FREIGHT_PAYMENT_TERM_OPTIONS = [
  FreightPaymentTerms.PREPAID,
  FreightPaymentTerms.COLLECT,
  FreightPaymentTerms.THIRD_PARTY
];
