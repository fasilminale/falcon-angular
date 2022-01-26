import {CarrierReference} from '../master-data-models/carrier-model';
import {CarrierModeCodeReference} from '../master-data-models/carrier-mode-code-model';
import {ServiceLevel} from '../master-data-models/service-level-model';
import { ShippingPointLocation } from '../location/location-model';

export interface TripInformation {
  tripId: string;
  invoiceDate: Date;
  pickUpDate?: Date;
  deliveryDate?: Date;
  proTrackingNumber: string;
  bolNumber: string;
  freightPaymentTerms: FreightPaymentTerms;
  carrier?: CarrierReference;
  carrierMode?: CarrierModeCodeReference;
  serviceLevel?: ServiceLevel;
  originAddress?: ShippingPointLocation,
  destinationAddress?: ShippingPointLocation
  billToAddress?: ShippingPointLocation
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
