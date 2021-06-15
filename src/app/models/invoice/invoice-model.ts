import {StatusModel} from './status-model';
import * as moment from 'moment';
import {LineItem} from '../line-item/line-item-model';
import {formatCurrency} from '@angular/common';
import {ElmDataTableHeader} from '@elm/elm-styleguide-ui';
import {Milestone} from '../milestone/milestone-model';

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

  status: StatusModel;
  statusLabel: string;
  falconInvoiceNumber: string;
  externalInvoiceNumber: string;
  amountOfInvoice: string;
  vendorNumber: string;
  invoiceDate: string;
  createdBy: string;
  companyCode: string;
  createdDate: string;
  workType: string;
  erpType: string;
  currency: string;
  standardPaymentTermsOverride: string;
  lineItems: Array<LineItem>;
  milestones: Array<Milestone>;

  constructor(json?: any) {
    this.status = json?.status
      ? new StatusModel(json.status)
      : new StatusModel();
    this.statusLabel = this.status.statusLabel;
    this.falconInvoiceNumber = json?.falconInvoiceNumber ?? '';
    this.externalInvoiceNumber = json?.externalInvoiceNumber ?? '';
    this.amountOfInvoice = json?.amountOfInvoice
      ? formatCurrency(json.amountOfInvoice, 'en-US', '$')
      : '';
    this.vendorNumber = json?.vendorNumber ?? '';
    this.invoiceDate = json?.invoiceDate
      ? moment(json.invoiceDate).format(InvoiceDataModel.dateFormat)
      : '';
    this.createdBy = json?.createdBy ?? '';
    this.companyCode = json?.companyCode ?? '';
    this.createdDate = json?.createdDate ?? '';
    this.workType = json?.workType ?? '';
    this.erpType = json?.erpType ?? '';
    this.currency = json?.currency ?? '';
    this.standardPaymentTermsOverride = json?.standardPaymentTermsOverride
      ? (json.standardPaymentTermsOverride === 'Z000' ? 'Immediately' : '14 Day')
      : '';
    this.lineItems = json?.lineItems ?? [];
    this.milestones = json?.milestones ?? [];
  }

}
