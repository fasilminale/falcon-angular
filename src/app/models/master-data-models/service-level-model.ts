import {SelectOption} from '../select-option-model/select-option-model';

export interface ServiceLevel {
  level: string;
  name: string;
}

export class ServiceLevelUtils {

  static toOptions(serviceLevels: Array<ServiceLevel>): Array<SelectOption<ServiceLevel>> {
    return serviceLevels.map(ServiceLevelUtils.toOption);
  }

  static toOption(serviceLevel: ServiceLevel): SelectOption<ServiceLevel> {
    return {
      label: `${serviceLevel.level} (${serviceLevel.name})`,
      value: serviceLevel
    };
  }

}
