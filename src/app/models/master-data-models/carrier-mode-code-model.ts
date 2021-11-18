import {SelectOption} from '../select-option-model/select-option-model';

export interface CarrierModeCode {
  mode: string;
  reportKeyMode: string;
  reportModeDescription: string;
  tripType: TripType;
}

export enum TripType {
  LOAD = 'LOAD',
  ROUTE = 'ROUTE',
  SCAC = 'SCAC',
  NONE = 'NONE'
}

export class CarrierModeCodeUtils {

  static toOptions(carrierModeCodes: Array<CarrierModeCode>): Array<SelectOption<CarrierModeCode>> {
    return carrierModeCodes.map(CarrierModeCodeUtils.toOption);
  }

  static toOption(carrierModeCode: CarrierModeCode): SelectOption<CarrierModeCode> {
    return {
      label: `${carrierModeCode.reportModeDescription} (${carrierModeCode.reportKeyMode})`,
      value: carrierModeCode
    };
  }

}
