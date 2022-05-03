import {SelectOption} from '../select-option-model/select-option-model';
import {InvoiceDataModel} from '../invoice/invoice-model';

export interface RateEngineRequest {
  mode: string;
  scac: string;
  shipDate: string;
  origin: Location;
  destination: Location;
  accessorialCodes: Array<string>;
  invoice: InvoiceDataModel;
}

export interface RateDetailResponse {
  mode: string;
  scac: string;
  shipDate: string;
  origin: Location;
  destination: Location;
  calcDetails: Array<CalcDetail>;
}

export interface RatesResponse {
  carrierRateSummaries: Array<CarrierRateSummary>;
  mode: string;
}

export interface CarrierRateSummary {
  legs: Array<Leg>;
  totalCost: string;
  scac: string;
}

export interface Leg {
  carrierRate: CarrierRate;
}

export interface CarrierRate {
  lineItems: Array<LineItem>;
}

export interface LineItem {
  description: string;
  rate: string;
  rateType: string;
  lineItemTotal: string;
  runningTotal: string;
  lineItemType: string;
  step: string;
  costName: string;
  quantity: number;
  message: string;
  accessorial: boolean;
}

export interface CalcDetail {
  name: string;
  accessorialCode: string;
  autoApprove?: boolean;
  attachmentRequired?: boolean;
  carrierEligible?: boolean;
  fuel?: boolean;
  variables?: Array<CalcDetailVariable>;
}

export interface CalcDetailVariable {
  variable: string;
  quantity: number;
}

export interface Location {
  streetAddress: string;
  locCode: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export const EMPTY_LOCATION: Location = {
  streetAddress: '',
  locCode: '',
  city: '',
  state: '',
  zip: '',
  country: ''
};

export class CostBreakDownUtils {

  static toOptions(calcDetails: Array<CalcDetail>): Array<SelectOption<CalcDetail>> {
    return calcDetails.map(CostBreakDownUtils.toOption);
  }

  static toOption(calcDetail: CalcDetail): SelectOption<CalcDetail> {
    return {
      label: calcDetail.name,
      value: calcDetail
    };
  }

}
