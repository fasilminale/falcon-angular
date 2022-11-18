import {InvoiceDataModel, InvoiceUtils} from './invoice-model';
import {TestBed} from '@angular/core/testing';
import {StatusModel} from './status-model';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {SelectOption} from '../select-option-model/select-option-model';
import {ShippingPointLocationSelectOption, ShippingPointWarehouseLocation} from '../location/location-model';

describe('Invoice Model Tests', () => {

  const expectedEmptyInvoice = {
    status: new StatusModel(),
    statusLabel: '',
    falconInvoiceNumber: '',
    externalInvoiceNumber: '',
    amountOfInvoice: '',
    vendorNumber: '',
    invoiceDate: '',
    createdBy: '',
    companyCode: '',
    createdDate: '',
    workType: '',
    erpType: '',
    currency: '',
    standardPaymentTermsOverride: '',
    lineItems: [],
    milestones: [],
    overriddenDeliveryDateTime: '',
    assumedDeliveryDateTime: '',
    tripTenderTime: '',
    billTo: {}
  };

  const invoice = {
    status: {
      label: 'Created',
      key: 'CREATED'
    },
    statusLabel: 'Created',
    falconInvoiceNumber: '123456',
    externalInvoiceNumber: '0000000001',
    amountOfInvoice: '2999.99',
    vendorNumber: '50000',
    invoiceDate: '07/10/2021',
    createdBy: 'user',
    companyCode: 'CO',
    createdDate: '07/10/2021',
    workType: 'Indirect Non-PO Invoice',
    erpType: 'Pharma Corp',
    currency: 'USD',
    standardPaymentTermsOverride: '',
    lineItems: [],
    milestones: [],
    overriddenDeliveryDateTime: '12/09/1990',
    assumedDeliveryDateTime: '02/11/1971',
    tripTenderTime: '02/11/1971',
    billTo: {}
  };

  const expectedInvoice = {
    status: new StatusModel({
      label: 'Created',
      key: 'CREATED'
    }),
    statusLabel: 'Created',
    falconInvoiceNumber: '123456',
    externalInvoiceNumber: '0000000001',
    amountOfInvoice: '$2,999.99',
    vendorNumber: '50000',
    invoiceDate: '07/10/2021',
    createdBy: 'user',
    companyCode: 'CO',
    createdDate: '07/10/2021',
    workType: 'Indirect Non-PO Invoice',
    erpType: 'Pharma Corp',
    currency: 'USD',
    standardPaymentTermsOverride: '',
    lineItems: [],
    milestones: [],
    overriddenDeliveryDateTime: '12/09/1990',
    assumedDeliveryDateTime: '02/11/1971',
    tripTenderTime: '02/11/1971',
    billTo: {}
  };

  let prototypeEmptyInvoice: InvoiceDataModel;
  let prototypeInvoice: InvoiceDataModel;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    }).compileComponents();
    prototypeEmptyInvoice = new InvoiceDataModel({});
    prototypeInvoice = new InvoiceDataModel(invoice);
  });

  function compareInvoice(data1: InvoiceDataModel, data2: any): void {
    expect(data1.status).toEqual(data2.status);
    expect(data1.statusLabel).toEqual(data2.statusLabel);
    expect(data1.falconInvoiceNumber).toEqual(data2.falconInvoiceNumber);
    expect(data1.externalInvoiceNumber).toEqual(data2.externalInvoiceNumber);
    expect(data1.amountOfInvoice).toEqual(data2.amountOfInvoice);
    expect(data1.vendorNumber).toEqual(data2.vendorNumber);
    expect(data1.invoiceDate).toEqual(data2.invoiceDate);
    expect(data1.createdBy).toEqual(data2.createdBy);
    expect(data1.companyCode).toEqual(data2.companyCode);
    expect(data1.createdDate).toEqual(data2.createdDate);
    expect(data1.workType).toEqual(data2.workType);
    expect(data1.erpType).toEqual(data2.erpType);
    expect(data1.standardPaymentTermsOverride).toEqual(data2.standardPaymentTermsOverride);
    expect(data1.overriddenDeliveryDateTime).toEqual(data2.overriddenDeliveryDateTime);
    expect(data1.assumedDeliveryDateTime).toEqual(data2.assumedDeliveryDateTime);
    expect(data1.tripTenderTime).toEqual(data2.tripTenderTime);
  }

  it('empty Invoice should equal test model', () => {
    expect(prototypeEmptyInvoice).not.toBeNull();
    compareInvoice(prototypeEmptyInvoice, expectedEmptyInvoice);
  });

  it('Invoice should equal test model', () => {
    expect(prototypeInvoice).not.toBeNull();
    compareInvoice(prototypeInvoice, expectedInvoice);
  });

  it('Should validate payment terms immediate value', () => {
    invoice.standardPaymentTermsOverride = 'Z000';
    const termsInvoiceTest = new InvoiceDataModel(invoice);
    expect(termsInvoiceTest).not.toBeNull();
    expect(termsInvoiceTest.standardPaymentTermsOverride).toEqual('Immediately');
  });

  it('Should validate payment terms 14 day value', () => {
    invoice.standardPaymentTermsOverride = 'ZN14';
    const termsInvoiceTest = new InvoiceDataModel(invoice);
    expect(termsInvoiceTest).not.toBeNull();
    expect(termsInvoiceTest.standardPaymentTermsOverride).toEqual('14 Day');
  });

  it('Should have remit history date of payment display value', () => {
    const invoice = new InvoiceDataModel({remitHistory: [{dateOfPayment: '2022-01-27T15:31:30.986Z'}]});
    expect(invoice.dateOfPaymentDisplay).toEqual('01/27/2022');
  });

  it('Should have empty remit history date of payment display value', () => {
    const invoice = new InvoiceDataModel({remitHistory: [null]});
    expect(invoice.dateOfPaymentDisplay).toEqual('');
  });

  describe('InvoiceUtils', () => {

    it('should construct SelectOption when toScacOption invoked ', () => {
      const carrier = {
        scac: 'ABCD',
        name: 'Vandalay Industries'
      };

      const result: SelectOption<string> = InvoiceUtils.toScacOption(carrier);

      expect(result.label).toEqual(`Vandalay Industries (ABCD)`);
    });

    it('should construct ShippingPointLocationSelectOption when toShippingPointLocation invoked ', () => {
      const carrierShippingPoint = {
        shippingPointCode: 'ABCD',
        businessUnitName: 'Vandalay Industries',
        origin: {}
      };

      const result: ShippingPointLocationSelectOption = InvoiceUtils.toShippingPointLocation(carrierShippingPoint);

      expect(result.label).toEqual(`ABCD`);
      expect(result.value).toEqual(`ABCD`);
    });

    it('should construct ShippingPointWarehouseLocation when toShippingPointWarehouseLocation invoked ', () => {
      const carrierShippingPointWarehouse = {
        shippingPointCode: 'ABCD',
        customerCategory: 'CAH',
        warehouse: '',
        billto: {}
      };

      const result: ShippingPointWarehouseLocation = InvoiceUtils.toShippingPointWarehouseLocation(carrierShippingPointWarehouse);

      expect(result.shippingPointCode).toEqual(`ABCD`);
      expect(result.customerCategory).toEqual(`CAH`);
    });
  });
});
