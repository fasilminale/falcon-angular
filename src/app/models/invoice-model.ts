import {StatusModel} from './status-model';
import * as moment from 'moment';
import {formatCurrency} from '@angular/common';

export class InvoiceDataModel {

  static invoiceTableHeaders = [
    {header: 'statusLabel', label: 'Status'},
    {header: 'falconInvoiceNumber', label: 'Falcon Invoice No.'},
    {header: 'externalInvoiceNumber', label: 'External Invoice No.'},
    {header: 'amountOfInvoice', label: 'Invoice Amount'},
    {header: 'vendorNumber', label: 'Vendor No.'},
    {header: 'invoiceDate', label: 'Invoice Date'},
    {header: 'createdBy', label: 'Created By'},
    {header: 'companyCode', label: 'Company Code'}
  ];

  static dateFormat = 'MM/DD/YYYY';

  status = new StatusModel();
  statusLabel = '';
  falconInvoiceNumber = '';
  externalInvoiceNumber = '';
  amountOfInvoice = '';
  vendorNumber = '';
  invoiceDate = '';
  createdBy = '';
  companyCode = '';
  createdDate = '';
  workType = '';
  erpType = '';
  currency = '';

  constructor(json?: any){
    if (json?.status) { this.status = new StatusModel(json.status); }
    if (this.status.label) { this.statusLabel = this.status.getLabel(); }
    if (json?.falconInvoiceNumber) { this.falconInvoiceNumber = json.falconInvoiceNumber; }
    if (json?.externalInvoiceNumber) { this.externalInvoiceNumber = json.externalInvoiceNumber; }
    if (json?.amountOfInvoice) {
      this.amountOfInvoice = formatCurrency(json.amountOfInvoice, 'en-US', json.currency === 'CAD' ? 'C$' : '$');
    }
    if (json?.vendorNumber) { this.vendorNumber = json.vendorNumber; }
    if (json?.invoiceDate) { this.invoiceDate = moment(json.invoiceDate).format(InvoiceDataModel.dateFormat); }
    if (json?.createdBy) { this.createdBy = json.createdBy; }
    if (json?.companyCode) { this.companyCode = json.companyCode; }
    if (json?.createdDate) { this.createdDate = json.createdDate; }
    if (json?.workType) { this.workType = json.workType; }
    if (json?.erpType) { this.erpType = json.erpType; }
    if (json?.currency) { this.currency = json.currency; }
  }
}
