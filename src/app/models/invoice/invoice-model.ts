import {StatusModel} from './status-model';
import * as moment from 'moment';
import {LineItem} from '../line-item/line-item-model';
import {formatCurrency} from '@angular/common';

export class InvoiceDataModel {

  static invoiceTableHeaders = [
    {header: 'statusLabel', label: 'Status'},
    {header: 'falconInvoiceNumber', label: 'Falcon Invoice Number'},
    {header: 'externalInvoiceNumber', label: 'External Invoice Number'},
    {header: 'amountOfInvoice', label: 'Invoice Amount'},
    {header: 'vendorNumber', label: 'Vendor Number'},
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
  lineItems: Array<LineItem> = [];

  constructor(json?: any) {
    if (json?.status) {
      this.status = new StatusModel(json.status);
    }
    if (this.status.label) {
      this.statusLabel = this.status.getLabel();
    }
    if (json?.falconInvoiceNumber) {
      this.falconInvoiceNumber = json.falconInvoiceNumber;
    }
    if (json?.externalInvoiceNumber) {
      this.externalInvoiceNumber = json.externalInvoiceNumber;
    }
    if (json?.amountOfInvoice) {
      this.amountOfInvoice = formatCurrency(json.amountOfInvoice, 'en-US', '$');
    }
    if (json?.vendorNumber) {
      this.vendorNumber = json.vendorNumber;
    }
    if (json?.invoiceDate) {
      this.invoiceDate = moment(json.invoiceDate).format(InvoiceDataModel.dateFormat);
    }
    if (json?.createdBy) {
      this.createdBy = json.createdBy;
    }
    if (json?.companyCode) {
      this.companyCode = json.companyCode;
    }
    if (json?.createdDate) {
      this.createdDate = json.createdDate;
    }
    if (json?.workType) {
      this.workType = json.workType;
    }
    if (json?.erpType) {
      this.erpType = json.erpType;
    }
    if (json?.currency) {
      this.currency = json.currency;
    }
    if (json?.lineItems) {
      this.lineItems = json.lineItems;
    }
  }

}
