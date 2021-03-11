import {InvoiceDataModel} from './invoice-model';
import {TestBed} from '@angular/core/testing';
import {AppModule} from '../app.module';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {StatusModel} from './status-model';

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
    currency: ''
  };

  const invoice = {
    status: new StatusModel({label: 'Invoice Created', key: 'CREATED'}),
    statusLabel: 'Invoice Created',
    falconInvoiceNumber: '123456',
    externalInvoiceNumber: '0000000001',
    amountOfInvoice: '2999.99',
    vendorNumber: '50000',
    invoiceDate: 'test',
    createdBy: 'user',
    companyCode: 'CO',
    createdDate: '08/31/2021',
    workType: 'Indirect Non-PO Invoice',
    erpType: 'Pharma Corp',
    currency: 'USD'
  };

  const expectedInvoice = {
    status: new StatusModel({label: 'Invoice Created', key: 'CREATED'}),
    statusLabel: 'Invoice Created',
    falconInvoiceNumber: '123456',
    externalInvoiceNumber: '0000000001',
    amountOfInvoice: '2999.99',
    vendorNumber: '50000',
    invoiceDate: 'test',
    createdBy: 'user',
    companyCode: 'CO',
    createdDate: '08/31/2021',
    workType: 'Indirect Non-PO Invoice',
    erpType: 'Pharma Corp',
    currency: 'USD'
  };

  let prototypeEmptyInvoice: InvoiceDataModel;
  let prototypeInvoice: InvoiceDataModel;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
    prototypeEmptyInvoice = new InvoiceDataModel({});
    prototypeInvoice = new InvoiceDataModel(invoice);
  });

  function compareInvoice(data1: InvoiceDataModel, data2: InvoiceDataModel): void {
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
  }

  it('empty CarrierShippingPoint should equal test model', () => {
    expect(prototypeEmptyInvoice).not.toBeNull();
    compareInvoice(prototypeEmptyInvoice, expectedEmptyInvoice);
  });

  it('CarrierShippingPoint should equal test model', () => {
    expect(prototypeInvoice).not.toBeNull();
    compareInvoice(prototypeInvoice, expectedInvoice);
  });
});
