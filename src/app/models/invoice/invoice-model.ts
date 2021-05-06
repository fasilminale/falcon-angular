import {StatusModel} from './status-model';
import * as moment from 'moment';
import {LineItem} from '../line-item/line-item-model';
import {formatCurrency} from '@angular/common';
import {ElmDataTableHeader} from '@elm/elm-styleguide-ui';

export class InvoiceDataModel {

  static invoiceTableHeaders: Array<ElmDataTableHeader> = [
    {header: 'statusLabel', label: 'Status'},
    {header: 'falconInvoiceNumber', label: 'Falcon Invoice Number', alignment: 'end'},
    {header: 'externalInvoiceNumber', label: 'External Invoice Number', alignment: 'end'},
    {header: 'amountOfInvoice', label: 'Invoice Amount', alignment: 'end'},
    {header: 'currency', label: 'Currency'},
    {header: 'vendorNumber', label: 'Vendor Number', alignment: 'end'},
    {header: 'invoiceDate', label: 'Invoice Date'},
    {header: 'createdBy', label: 'Created By'},
    {header: 'companyCode', label: 'Company Code', alignment: 'end'},
    {header: 'standardPaymentTermsOverride', label: 'Override'}
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
  standardPaymentTermsOverride = '';
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
    if (json?.standardPaymentTermsOverride) {
      this.standardPaymentTermsOverride = json.standardPaymentTermsOverride === 'Z000' ? 'Immediately' : '14 Day';
    }
    if (json?.lineItems) {
      this.lineItems = json.lineItems;
    }
  }

}
