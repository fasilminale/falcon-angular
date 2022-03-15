import {SelectOption} from '../select-option-model/select-option-model';

export interface CarrierModeCode {
  mode: string;
  reportKeyMode: string;
  reportModeDescription: string;
  tripType: TripType;
}

export interface CarrierModeCodeReference {
  reportKeyMode: string;
  reportModeDescription: string;
}

export const EMPTY_CARRIER_MODE_CODE_REFERENCE: CarrierModeCodeReference = {
  reportKeyMode: '',
  reportModeDescription: ''
};

export enum TripType {
  LOAD = 'LOAD',
  ROUTE = 'ROUTE',
  SCAC = 'SCAC',
  NONE = 'NONE'
}

export class CarrierModeCodeUtils {

  static toOptions(carrierModeCodes: Array<CarrierModeCodeReference>): Array<SelectOption<CarrierModeCodeReference>> {
    return carrierModeCodes.map(CarrierModeCodeUtils.toOption);
  }

  static toOption(carrierModeCode: CarrierModeCodeReference): SelectOption<CarrierModeCodeReference> {
    return {
      label: CarrierModeCodeUtils.toDisplayLabel(carrierModeCode),
      value: carrierModeCode
    };
  }

  static toDisplayLabel(carrierModeCode?: CarrierModeCodeReference): string {
    return carrierModeCode
      ? `${carrierModeCode.reportKeyMode} (${carrierModeCode.reportModeDescription})`
      : '';
  }

}
