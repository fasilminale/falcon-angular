export interface Invoice {
  workType: string;
  externalInvoiceNumber: string;
  invoiceDate: string;
  createdDate: string;
  falconInvoiceNumber: string;
  companyName: string;
  companyCode: string;
  amountOfInvoice: number;
  erpType: string;
  createdBy: string;
  vendorNumber: string;
}

export const INVOICE_FIELDS = [
  {header: 'workType', label: 'Work Type'},
  {header: 'externalInvoiceNumber', label: 'Ext. Invoice No.'},
  {header: 'invoiceDate', label: 'Invoice Date'},
  {header: 'createdDate', label: 'Created Date'},
  {header: 'falconInvoiceNumber', label: 'Falcon Invoice No.'},
  {header: 'companyName', label: 'Company Name'},
  {header: 'companyCode', label: 'Company Code'},
  {header: 'amountOfInvoice', label: 'Amount'},
  {header: 'erpType', label: 'ERP Type'},
  {header: 'createdBy', label: 'Created By'},
  {header: 'vendorNumber', label: 'Vendor No.'},
];

export function isInvoice(arg: any): arg is Invoice {
  return INVOICE_FIELDS
    .filter(field => arg[field.header] === undefined)
    .length <= 0;
}

export const EXAMPLE_INVOICE = {
  workType: 'Indirect Non-PO Invoice',
  externalInvoiceNumber: '56123',
  invoiceDate: '08/31/2021',
  createdDate: '01/15/2021',
  falconInvoiceNumber: 'CAH-1234567',
  companyName: 'Some Company',
  companyCode: '0000000',
  amountOfInvoice: 4532.60,
  erpType: 'Pharma Corp',
  createdBy: 'Grimes, Ron',
  vendorNumber: '895421'
};


