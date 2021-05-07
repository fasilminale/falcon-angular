import {InvoiceDataModel} from './invoice-model';
import {TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {StatusModel} from './status-model';
import {AppModule} from '../../app.module';

describe('Invoice Model Tests', () => {

  const expectedEmptyInvoice: InvoiceDataModel = {
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
    lineItems: []
  };

  const invoice = {
    status: new StatusModel({label: 'Invoice Created', key: 'CREATED'}),
    statusLabel: 'Invoice Created',
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
    lineItems: []
  };

  const expectedInvoice = {
    status: new StatusModel({label: 'Invoice Created', key: 'CREATED'}),
    statusLabel: 'Invoice Created',
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
    lineItems: []
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
    expect(data1.standardPaymentTermsOverride).toEqual(data2.standardPaymentTermsOverride);
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
});
