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