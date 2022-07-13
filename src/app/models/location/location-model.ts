import { FormGroup } from "@angular/forms";

export interface Location {
  name: string;
  code?: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export const EMPTY_LOCATION: Location = {
  name: '',
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: ''
};

export const EMPTY_BILL_TO_LOCATION: BillToLocation = {
  name: '',
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  idCode: '',
  name2: ''
};

export interface ShippingPointLocation extends Location{
  shippingPoint?: string;
}

export interface ShippingPointLocationSelectOption {
  label: string;
  value: string;
  businessUnit: string;
  location: Location
}

export interface BillToLocation extends Location {
  name2: string;
  idCode?: string;
}

export interface ShippingPointWarehouseLocation {
  warehouse: string;
  customerCategory: string;
  shippingPointCode: string;
  billto: BillToLocation;
}

export class CommonUtils {
  static handleNAValues(value: any, defaultValue?: any): any {
    return value === 'N/A' ? defaultValue : value;
  }
}

export class LocationUtils {

  static extractLocation(locationFormGroup: any, type?: string, destinationCode?: string): Location {
    let locationObject: Location =  {
      name: CommonUtils.handleNAValues(locationFormGroup?.controls?.name?.value),
      city: CommonUtils.handleNAValues(locationFormGroup?.controls?.city?.value),
      country: CommonUtils.handleNAValues(locationFormGroup?.controls?.country?.value),
      zipCode: CommonUtils.handleNAValues(locationFormGroup?.controls?.zipCode?.value),
      state: CommonUtils.handleNAValues(locationFormGroup?.controls?.state?.value),
      address: CommonUtils.handleNAValues(locationFormGroup?.controls?.streetAddress?.value),
      address2: CommonUtils.handleNAValues(locationFormGroup?.controls?.streetAddress2?.value)
    };
    if (type === 'origin') {
      locationObject.code = CommonUtils.handleNAValues(locationFormGroup?.controls?.shippingPoint?.value);
    }
    if (type === 'destination') {
      locationObject.code = destinationCode;
    }
    return locationObject;
  }

  static extractShippingPointLocation(locationFormGroup: any, type?: string, destinationCode?: string): ShippingPointLocation {
    let locationObject: ShippingPointLocation =  {
      shippingPoint: CommonUtils.handleNAValues(locationFormGroup?.controls?.shippingPoint?.value),
      name: CommonUtils.handleNAValues(locationFormGroup?.controls?.name?.value),
      city: CommonUtils.handleNAValues(locationFormGroup?.controls?.city?.value),
      country: CommonUtils.handleNAValues(locationFormGroup?.controls?.country?.value),
      zipCode: CommonUtils.handleNAValues(locationFormGroup?.controls?.zipCode?.value),
      state: CommonUtils.handleNAValues(locationFormGroup?.controls?.state?.value),
      address: CommonUtils.handleNAValues(locationFormGroup?.controls?.streetAddress?.value),
      address2: CommonUtils.handleNAValues(locationFormGroup?.controls?.streetAddress2?.value)
    };
    if (type === 'origin') {
      locationObject.code = CommonUtils.handleNAValues(locationFormGroup?.controls?.shippingPoint?.value);
    }
    if (type === 'destination') {
      locationObject.code = destinationCode;
    }
    return locationObject;
  }
}

export class BillToLocationUtils {

  static extractBillToLocation(locationFormGroup: any): BillToLocation {
    return {
      name: CommonUtils.handleNAValues(locationFormGroup?.controls?.name?.value),
      city: CommonUtils.handleNAValues(locationFormGroup?.controls?.city?.value),
      country: CommonUtils.handleNAValues(locationFormGroup?.controls?.country?.value),
      zipCode: CommonUtils.handleNAValues(locationFormGroup?.controls?.zipCode?.value),
      state: CommonUtils.handleNAValues(locationFormGroup?.controls?.state?.value),
      address: CommonUtils.handleNAValues(locationFormGroup?.controls?.streetAddress?.value),
      address2: CommonUtils.handleNAValues(locationFormGroup?.controls?.streetAddress2?.value),
      name2: CommonUtils.handleNAValues(locationFormGroup?.controls?.name2?.value),
      idCode: CommonUtils.handleNAValues(locationFormGroup?.controls?.idCode?.value),
    };
  }
}