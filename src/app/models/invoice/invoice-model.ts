import {LineItem} from '../line-item/line-item-model';

export interface Invoice {
  workType: string;
  externalInvoiceNumber: string;
  invoiceDate: string;
  companyCode: string;
  amountOfInvoice: number;
  erpType: string;
  createdBy: string;
  vendorNumber: string;
  currency: string;
  lineItems: Array<LineItem>;
}

export const INVOICE_FIELDS = [
  {header: 'workType', label: 'Work Type'},
  {header: 'companyCode', label: 'Company Code'},
  {header: 'externalInvoiceNumber', label: 'Ext. Invoice No.'},
  {header: 'erpType', label: 'ERP Type'},
  {header: 'vendorNumber', label: 'Vendor No.'},
  {header: 'invoiceDate', label: 'Invoice Date'},
  {header: 'amountOfInvoice', label: 'Amount'},
  {header: 'currency', label: 'Currency'},
  {header: 'createdBy', label: 'Created By'},
];

export function isInvoice(arg: any): arg is Invoice {
  return INVOICE_FIELDS
    .filter(field => arg[field.header] === undefined)
    .length <= 0;
}

export const EXAMPLE_INVOICE: Invoice = {
  workType: 'Indirect Non-PO Invoice',
  externalInvoiceNumber: '56123',
  invoiceDate: '08/31/2021',
  companyCode: '0000000',
  amountOfInvoice: 4532.60,
  erpType: 'Pharma Corp',
  createdBy: 'Grimes, Ron',
  vendorNumber: '895421',
  currency: 'USD',
  lineItems: [{
    lineItemNumber: '124',
    lineItemNetAmount: 200.35,
    companyCode: '8888888',
    costCenter: 'ASDF',
    glAccount: '1839402',
    notes: 'some notes'
  }]
};


