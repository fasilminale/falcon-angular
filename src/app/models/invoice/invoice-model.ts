import {StatusModel} from './status-model';
import * as moment from 'moment';
import {LineItem} from '../line-item/line-item-model';
import {formatCurrency} from '@angular/common';
import {Milestone} from '../milestone/milestone-model';
import {Attachment} from './attachment-model';
import {KeyedLabel} from '../generic/keyed-label';

export class InvoiceDataModel {

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
    this.statusLabel = this.status.label;
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

export interface Invoice {
  falconInvoiceNumber: string;
  failedToCreate: boolean;
  status: KeyedLabel;
  createdBy: string;
  workType: string;
  externalInvoiceNumber: string;
  invoiceDate: string;
  companyCode: string;
  erpType: string;
  vendorNumber: string;
  amountOfInvoice: number;
  currency: string;
  standardPaymentTermsOverride?: string;
  lineItems: Array<LineItem>;
  milestones: Array<Milestone>;
  attachments: Array<Attachment>;
  comments: string;
}

