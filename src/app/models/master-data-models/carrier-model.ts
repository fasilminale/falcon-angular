import {YesNo} from './yes-no-model';
import {SelectOption} from '../select-option-model/select-option-model';

export interface Carrier {
  scac: string;
  name: string;
  dunsNumber?: number;
  usdot?: number;
  mcNumber?: number;
  tenderMethod: TenderMethod;
  tenderEmail?: string;
  tenderAutoAccept: YesNo;
  pushPay?: YesNo;
  autoPay?: YesNo;
  currencyCode?: string;
}

export interface CarrierReference {
  name: string;
  scac: string;
}

export const EMPTY_CARRIER_REFERENCE: CarrierReference = {
  name: '',
  scac: ''
};

export enum TenderMethod {
  EDI_API = 'EDI_API',
  EMAIL = 'EMAIL',
  NONE = 'NONE'
}

export class CarrierUtils {

  static toOptions(carriers: Array<CarrierReference>): Array<SelectOption<CarrierReference>> {
    return carriers.map(CarrierUtils.toOption);
  }

  static toOption(carrier: CarrierReference): SelectOption<CarrierReference> {
    return {
      label: CarrierUtils.toDisplayLabel(carrier),
      value: carrier
    };
  }

  static toDisplayLabel(carrier?: CarrierReference): string {
    return carrier
      ? `${carrier.scac} (${carrier.name})`
      : '';
  }
}

