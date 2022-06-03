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
      label: ServiceLevelUtils.toDisplayLabel(serviceLevel),
      value: serviceLevel
    };
  }

  static toDisplayLabel(serviceLevel: ServiceLevel): string {
    return serviceLevel
      ? `${serviceLevel.level} (${serviceLevel.name})`
      : '';
  }

}
