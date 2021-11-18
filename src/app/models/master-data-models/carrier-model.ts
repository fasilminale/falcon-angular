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

export enum TenderMethod {
  EDI_API = 'EDI_API',
  EMAIL = 'EMAIL',
  NONE = 'NONE'
}

export class CarrierUtils {

  static toOptions(carriers: Array<Carrier>): Array<SelectOption<Carrier>> {
    return carriers.map(CarrierUtils.toOption);
  }

  static toOption(carrier: Carrier): SelectOption<Carrier> {
    return {
      label: `${carrier.scac} (${carrier.name})`,
      value: carrier
    };
  }

}

