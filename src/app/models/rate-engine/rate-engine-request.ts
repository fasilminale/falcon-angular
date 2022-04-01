import {SelectOption} from '../select-option-model/select-option-model';

export interface RateEngineRequest {
  mode: string;
  scac: string;
  shipDate: string;
  origin: Location;
  destination: Location;
  accessorialCodes: Array<string>;
}

export interface RateEngineResponse {
  mode: string;
  scac: string;
  shipDate: string;
  origin: Location;
  destination: Location;
  calcDetails: Array<CalcDetail>;
}

export interface CalcDetail {
  name: string;
  accessorialCode: string;
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
