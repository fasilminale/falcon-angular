import {StatusModel} from './status-model';
import * as moment from 'moment';
import {CostLineItem, GlLineItem, ManualLineItem} from '../line-item/line-item-model';
import {formatCurrency} from '@angular/common';
import {Milestone} from '../milestone/milestone-model';
import {Attachment} from '../attachment/attachment-model';
import {KeyedLabel} from '../generic/keyed-label';
import {
  CarrierModeCodeReference,
  CarrierModeCodeUtils,
  EMPTY_CARRIER_MODE_CODE_REFERENCE,
  TripType
} from '../master-data-models/carrier-mode-code-model';
import {FreightOrder} from '../freight-order/freight-order-model';
import {CarrierReference, CarrierUtils, EMPTY_CARRIER_REFERENCE} from '../master-data-models/carrier-model';
import {Location, EMPTY_LOCATION} from '../location/location-model';
import { ServiceLevel } from '../master-data-models/service-level-model';

export class InvoiceDataModel {

  static dateFormat = 'MM/DD/YYYY';

  /* --- BASE INVOICE FIELDS --- */
  falconInvoiceNumber: string;
  createdBy: string;
  comments: string;
  currency: string;
  amountOfInvoice: string;
  status: KeyedLabel;
  statusLabel: string;
  entryType: EntryType;
  invoiceDate: string;
  createdDate: string;
  modifiedDateTime: string;
  modifiedUserId: string;
  milestones: Array<Milestone>;
  deleted: boolean;
  failedToCreate: boolean;

  /* --- MANUAL INVOICE FIELDS --- */
  workType: string;
  externalInvoiceNumber: string;
  companyCode: string;
  erpType: string;
  vendorNumber: string;
  standardPaymentTermsOverride: string;
  lineItems: Array<ManualLineItem>;
  attachments: Array<Attachment>;

  /* --- AUTOMATED INVOICE: REMITTANCE FIELDS --- */
  erpInvoiceNumber: string;
  erpRemittanceNumber: string;
  remitVendorId: string;
  amountOfPayment: string;
  dateOfPayment: string;

  /* --- AUTOMATED INVOICE: TRIP FIELDS --- */
  tripId: string;
  tripType: TripType;
  invoiceReference: string;
  carrier: CarrierReference;
  carrierDisplay: string;
  mode: CarrierModeCodeReference;
  carrierModeDisplay: string;
  freightPaymentTerms: string;
  serviceLevel: ServiceLevel;
  trackingNumber: string;
  proNumber: string;
  billOfLadingNumber: string;
  vendorPaymentTermsOverride: string;
  paymentDue: string;
  paymentDueDisplay: string;
  segment: string;
  businessUnit: string;
  shippingPoint: string;
  originType: string;
  origin: Location;
  destinationType: string;
  destination: Location;
  billTo: Location;
  shippedDateTime: string;
  estimatedPickupDateTime: string;
  pickupDateTime: string;
  deliveryDateTime: string;

  /* --- AUTOMATED INVOICE: COST BREAKDOWN FIELDS --- */
  deliveryInstructions: Array<string>;
  lineHaulCharge: string;
  fuelCharge: string;
  surcharge: string;
  nonFuelCharge: string;
  totalAmount: string;
  plannedInvoiceNetAmount: string;
  distance: string;
  costLineItems: Array<CostLineItem>;
  totalGlAmount: string;
  glLineItems: Array<GlLineItem>;
  freightOrders: Array<FreightOrder>;

  constructor(json?: any) {
    const {currency, status, date, paymentTerms} = InvoiceDataModel;

    // BASE INVOICE
    this.falconInvoiceNumber = json?.falconInvoiceNumber ?? '';
    this.createdBy = json?.createdBy ?? '';
    this.comments = json?.comments ?? '';
    this.currency = json?.currency ?? '';
    this.amountOfInvoice = currency(json?.amountOfInvoice);
    this.status = status(json?.status);
    this.statusLabel = this.status.label;
    this.entryType = json?.entryType ?? EntryType.MANUAL;
    this.invoiceDate = date(json?.invoiceDate);
    this.createdDate = date(json?.createdDate);
    this.modifiedDateTime = date(json?.modifiedDateTime);
    this.modifiedUserId = json?.modifiedUserId ?? '';
    this.milestones = json?.milestones ?? [];
    this.deleted = !!json?.deleted;
    this.failedToCreate = !!json?.failedToCreate;

    // MANUAL INVOICE
    this.workType = json?.workType ?? '';
    this.externalInvoiceNumber = json?.externalInvoiceNumber ?? '';
    this.companyCode = json?.companyCode ?? '';
    this.erpType = json?.erpType ?? '';
    this.vendorNumber = json?.vendorNumber ?? '';
    this.standardPaymentTermsOverride = paymentTerms(json?.standardPaymentTermsOverride);
    this.lineItems = json?.lineItems ?? [];
    this.attachments = json?.attachments ?? [];

    // AUTOMATED INVOICE: REMITTANCE
    this.erpInvoiceNumber = json?.erpInvoiceNumber ?? '';
    this.erpRemittanceNumber = json?.erpRemittanceNumber ?? '';
    this.remitVendorId = json?.remitVendorId ?? '';
    this.amountOfPayment = currency(json?.amountOfPayment);
    this.dateOfPayment = date(json?.dateOfPayment);

    // AUTOMATED INVOICE: TRIP
    this.tripId = json?.tripId ?? '';
    this.tripType = json?.tripType ?? TripType.NONE;
    this.invoiceReference = json?.invoiceReference ?? '';
    this.carrier = json?.carrier ?? EMPTY_CARRIER_REFERENCE;
    this.carrierDisplay = CarrierUtils.toDisplayLabel(json?.carrier);
    this.mode = json?.mode ?? EMPTY_CARRIER_MODE_CODE_REFERENCE;
    this.carrierModeDisplay = CarrierModeCodeUtils.toDisplayLabel(json?.mode);
    this.freightPaymentTerms = json?.freightPaymentTerms ?? '';
    this.serviceLevel = json?.serviceLevel ?? '';
    this.trackingNumber = json?.trackingNumber ?? '';
    this.proNumber = json?.proNumber ?? '';
    this.billOfLadingNumber = json?.billOfLadingNumber ?? '';
    this.vendorPaymentTermsOverride = json?.vendorPaymentTermsOverride ?? '';
    this.paymentDue = date(json?.paymentDue);
    if (this.standardPaymentTermsOverride === 'Immediately') {
      this.paymentDueDisplay = 'IMMEDIATE';
    } else if (this.standardPaymentTermsOverride === '14 Day') {
      this.paymentDueDisplay = moment(this.invoiceDate)
        .add(14, 'days')
        .format(InvoiceDataModel.dateFormat);
    } else {
      this.paymentDueDisplay = moment(this.invoiceDate)
        .add(30, 'days')
        .format(InvoiceDataModel.dateFormat);
    }
    this.segment = json?.segment ?? '';
    this.businessUnit = json?.businessUnit ?? '';
    this.shippingPoint = json?.shippingPoint ?? '';
    this.originType = json?.originType ?? '';
    this.origin = json?.origin ?? EMPTY_LOCATION;
    this.destinationType = json?.destinationType ?? '';
    this.destination = json?.destination ?? EMPTY_LOCATION;
    this.billTo = json?.billTo ?? EMPTY_LOCATION;
    this.shippedDateTime = date(json?.shippedDateTime);
    this.estimatedPickupDateTime = date(json?.estimatedPickupDateTime);
    this.pickupDateTime = date(json?.pickupDateTime);
    this.deliveryDateTime = date(json?.deliveryDateTime);

    // AUTOMATED INVOICE: COST BREAKDOWN
    this.deliveryInstructions = json?.deliveryInstructions ?? [];
    this.lineHaulCharge = currency(json?.lineHaulCharge);
    this.fuelCharge = currency(json?.fuelCharge);
    this.surcharge = currency(json?.surcharge);
    this.nonFuelCharge = currency(json?.nonFuelCharge);
    this.totalAmount = currency(json?.totalAmount);
    this.plannedInvoiceNetAmount = currency(json?.plannedInvoiceNetAmount);
    this.distance = json?.distance ?? '';
    this.costLineItems = json?.costLineItems ?? [];
    this.totalGlAmount = currency(json?.totalGlAmount);
    this.glLineItems = json?.glLineItems ?? [];
    this.freightOrders = json?.freightOrders ?? [];
  }

  private static currency(value?: any, defaultValue: string = ''): string {
    return value
      ? formatCurrency(value, 'en-US', '$')
      : defaultValue;
  }

  private static status(value?: any, defaultValue: StatusModel = new StatusModel()): StatusModel {
    return value
      ? new StatusModel(value)
      : defaultValue;
  }

  private static date(value?: any, defaultValue: string = ''): string {
    return value
      ? moment(value).format(InvoiceDataModel.dateFormat)
      : defaultValue;
  }

  private static paymentTerms(value?: any, defaultValue: string = ''): string {
    if (value) {
      return value === 'Z000' ? 'Immediately' : '14 Day';
    }
    return defaultValue;
  }

}

export enum EntryType {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL'
}

export interface Invoice {
  falconInvoiceNumber: string;
  failedToCreate: boolean;
  status: KeyedLabel;
  createdBy: string;
  workType: string;
  externalInvoiceNumber: string;
  invoiceDate: string;
  companyCode: string;
  erpType: string;
  vendorNumber: string;
  amountOfInvoice: number;
  currency: string;
  standardPaymentTermsOverride?: string;
  lineItems: Array<ManualLineItem>;
  milestones: Array<Milestone>;
  attachments: Array<Attachment>;
  comments: string;
}

