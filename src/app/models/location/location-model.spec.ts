import {Location, BillToLocation, CommonUtils, LocationUtils, BillToLocationUtils, ShippingPointLocation} from './location-model';
import {TestBed} from '@angular/core/testing';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

describe('Location and BillToLocation Model Tests', () => {
    const MOCK_LOCATION: Location = {
        name: 'test',
        address: '123 Fake Street',
        address2: 'address2',
        city: 'test',
        country: 'USA',
        state: 'TS',
        zipCode: '12345',
        code: 'TXH',
    };
    const MOCK_SHIPPING_POINT_LOCATION: ShippingPointLocation = {
      shippingPoint: MOCK_LOCATION.code,
      name: MOCK_LOCATION.name,
      address: MOCK_LOCATION.address,
      address2: MOCK_LOCATION.address2,
      city: MOCK_LOCATION.city,
      country: MOCK_LOCATION.country,
      state: MOCK_LOCATION.state,
      zipCode: MOCK_LOCATION.zipCode,
      code: MOCK_LOCATION.code
    };
    const originAddressFormGroup = new UntypedFormGroup({
      streetAddress: new UntypedFormControl(MOCK_LOCATION.address),
      streetAddress2: new UntypedFormControl(MOCK_LOCATION.address2),
      city: new UntypedFormControl(MOCK_LOCATION.city),
      country: new UntypedFormControl(MOCK_LOCATION.country),
      name: new UntypedFormControl(MOCK_LOCATION.name),
      state: new UntypedFormControl(MOCK_LOCATION.state),
      zipCode: new UntypedFormControl(MOCK_LOCATION.zipCode),
      shippingPoint: new UntypedFormControl(MOCK_SHIPPING_POINT_LOCATION.shippingPoint)
    });
    const destinationAddressFormGroup = new UntypedFormGroup({
      streetAddress: new UntypedFormControl(MOCK_LOCATION.address),
      streetAddress2: new UntypedFormControl(MOCK_LOCATION.address2),
      city: new UntypedFormControl(MOCK_LOCATION.city),
      country: new UntypedFormControl(MOCK_LOCATION.country),
      name: new UntypedFormControl(MOCK_LOCATION.name),
      state: new UntypedFormControl(MOCK_LOCATION.state),
      zipCode: new UntypedFormControl(MOCK_LOCATION.zipCode),
      shippingPoint: new UntypedFormControl(MOCK_SHIPPING_POINT_LOCATION.shippingPoint)
    });
    const billToAddressFormGroup = new UntypedFormGroup({
      streetAddress: new UntypedFormControl('123 Fake Street'),
      streetAddress2: new UntypedFormControl('address2'),
      city: new UntypedFormControl('test'),
      country: new UntypedFormControl('USA'),
      name: new UntypedFormControl('test'),
      state: new UntypedFormControl('TS'),
      zipCode: new UntypedFormControl('12345'),
      idCode: new UntypedFormControl('idCode'),
      name2: new UntypedFormControl('name2'),
    });

    
    beforeEach(() => {
        TestBed.configureTestingModule({
          imports: [FalconTestingModule],
        }).compileComponents();
    });

    describe('CommonUtils', () => {
        it('should handleValues without default value', () => {
            const result = CommonUtils.handleNAValues('N/A');
            expect(result).toBeUndefined();
        });
        it('should handleValues with default value', () => {
            const result = CommonUtils.handleNAValues('N/A', 'origin');
            expect(result).toEqual('origin');
        });
    });

    describe('LocationUtils', () => {

        it('should extract bad location data', () => {
            const location = LocationUtils.extractLocation(null as  any, 'origin');
            expect(location).toEqual({
                name: undefined as any,
                city: undefined as any,
                country: undefined as any,
                zipCode: undefined as any,
                state: undefined as any,
                address: undefined as any,
                address2: undefined as any,
                code: undefined as any
            });
        });

        it('should extract valid location data', () => {
            const location = LocationUtils.extractLocation(originAddressFormGroup, 'origin');
            expect(location).toEqual(MOCK_LOCATION);
        });

        it('should extract bad location data for destination', () => {
            const location = LocationUtils.extractLocation(null as any, 'destination');
            expect(location).toEqual({
                name: undefined as any,
                city: undefined as any,
                country: undefined as any,
                zipCode: undefined as any,
                state: undefined as any,
                address: undefined as any,
                address2: undefined as any,
                code: undefined as any
            });
        });

        it('should extract valid location data for destination', () => {
            const location = LocationUtils.extractLocation(destinationAddressFormGroup, 'destination', 'TXH');
            expect(location).toEqual(MOCK_LOCATION);
        });
      
        it('should extract valid location data for destination without destination code', () => {
          const location = LocationUtils.extractLocation(destinationAddressFormGroup, 'destination');
          let expected = MOCK_LOCATION;
          expected.code = undefined;
          expect(location).toEqual(expected);
        });

        it('should extract bad shipping point location data', () => {
            const location = LocationUtils.extractShippingPointLocation(null as  any, 'origin');
            expect(location).toEqual({
                shippingPoint: undefined as any,
                name: undefined as any,
                city: undefined as any,
                country: undefined as any,
                zipCode: undefined as any,
                state: undefined as any,
                address: undefined as any,
                address2: undefined as any,
                code: undefined as any
            });
        });

        it('should extract valid shipping point location data', () => {
            const location = LocationUtils.extractShippingPointLocation(originAddressFormGroup, 'origin');
            expect(location).toEqual(MOCK_SHIPPING_POINT_LOCATION);
        });

        it('should extract bad shipping point location data for destination', () => {
            const location = LocationUtils.extractShippingPointLocation(null as any, 'destination');
            expect(location).toEqual({
                shippingPoint: undefined as any,
                name: undefined as any,
                city: undefined as any,
                country: undefined as any,
                zipCode: undefined as any,
                state: undefined as any,
                address: undefined as any,
                address2: undefined as any,
                code: undefined as any
            });
        });

        it('should extract valid shipping point location data for destination', () => {
            const location = LocationUtils.extractShippingPointLocation(destinationAddressFormGroup, 'destination', 'TXH');
            console.log(location);
            expect(location).toEqual(MOCK_SHIPPING_POINT_LOCATION);
        });
      
        it('should extract valid shipping point location data for destination without destination code', () => {
          const location = LocationUtils.extractShippingPointLocation(destinationAddressFormGroup, 'destination');
          let expected = MOCK_SHIPPING_POINT_LOCATION;
          expected.code = undefined;
          console.log(location);
          expect(location).toEqual(expected);
        });
    });

    describe('BillToLcationUtils', () => {

        it('should extract bad bill to location data', () => {
            const location = BillToLocationUtils.extractBillToLocation(null as any);
            expect(location).toEqual({
                name: undefined as any,
                city: undefined as any,
                country: undefined as any,
                zipCode: undefined as any,
                state: undefined as any,
                address: undefined as any,
                address2: undefined as any,
                name2: undefined as any,
                idCode: undefined as any,
            });
        });
      
        it('should extract valid bill to location data', () => {
            const location = BillToLocationUtils.extractBillToLocation(billToAddressFormGroup);
            expect(location).toEqual({
                name: 'test',
                city: 'test',
                country: 'USA',
                zipCode: '12345',
                state: 'TS',
                address: '123 Fake Street',
                address2: 'address2',
                name2: 'name2',
                idCode: 'idCode',
            });
        });
    });
});