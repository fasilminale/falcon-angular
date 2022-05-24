import {Measurement, UnitOfMeasure} from '../measurement/measurement-model';
import {KeyedLabel} from '../generic/keyed-label';

export interface ManualLineItem {
  lineItemNumber: string;
  glAccount: string;
  costCenter: string;
  companyCode: string;
  lineItemNetAmount: number;
  notes: string;
}

export interface CostLineItem {
  accessorial?: boolean;
  accessorialCode?: string;
  chargeCode: string;
  rateSource: KeyedLabel;
  entrySource: KeyedLabel;
  costName: string;
  quantity: number;
  rateAmount: number;
  rateType: string;
  chargeLineTotal: number;
  requestStatus: KeyedLabel;
  createdBy: string;
  createdDate?: string;
  closedBy: string;
  closedDate?: string;
  carrierComment: string;
  responseComment: string;
  rateResponse: string;
  variables: Array<any>;
  attachmentLink: string;
  autoApproved: boolean;
  attachmentRequired: boolean;
  planned: boolean;
  fuel: boolean;
  message: string;
  manual: boolean;
  expanded: boolean;
  step?: string;
  runningTotal?: number;
  lineItemType?: string;

  //private List<Accessorial.AccessorialVariable> variables = new ArrayList<>();

}

export interface Variable {
  variable: string;
  quantity: string;
}

export interface DisputeLineItem {
  comment: string;
  attachment: string;
  createdDate: string;
  createdBy: string;
  disputeStatus: KeyedLabel;
  responseComment: string;
  closedDate: string;
  closedBy: string;
}

export interface GlLineItem {
  allocationPercent: number;
  customerCategory: string;
  shippingPointWarehouse: string;
  glCompanyCode: string;
  glCostCenter: string;
  glProfitCenter: string;
  glAccount: string;
  glAmount: number;
  debitCreditFlag: string;
}

export interface FreightOrderLineItem {
  customerMaterialNumber: string;
  materialNumber: string;
  materialDescription: string;
  itemNumber: number;
  nationalMotorFreightCode: string;
  nationalMotorFreightCodeDescription: string;
  sapStorageCode: string;
  freightClass: string;
  unitOfMeasure: UnitOfMeasure;
  shipViaAir: string;
  customerPurchaseOrder: string;
  customerSalesOrder: string;
  quantity: Measurement;
  quantityDelivered: Measurement;
  volume: Measurement;
  weight: Measurement;
  weightDelivered: Measurement;
  height: Measurement;
  length: Measurement;
}
