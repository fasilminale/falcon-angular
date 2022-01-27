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
