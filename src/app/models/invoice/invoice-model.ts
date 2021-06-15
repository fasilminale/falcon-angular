import {StatusModel} from './status-model';
import * as moment from 'moment';
import {LineItem} from '../line-item/line-item-model';
import {formatCurrency} from '@angular/common';
import {MilestoneModel} from '../milestone/milestone-model';

export class InvoiceDataModel {

  static dateFormat = 'MM/DD/YYYY';

  readonly status;
  readonly statusLabel;
  readonly falconInvoiceNumber;
  readonly externalInvoiceNumber;
  readonly amountOfInvoice;
  readonly vendorNumber;
  readonly invoiceDate;
  readonly createdBy;
  readonly companyCode;
  readonly createdDate;
  readonly workType;
  readonly erpType;
  readonly currency;
  readonly standardPaymentTermsOverride;
  readonly lineItems: Array<LineItem>;
  readonly milestones: Array<MilestoneModel>;
  readonly comments;
  readonly attachments: Array<any>;

  constructor(json?: any) {
    this.status = json?.status
      ? new StatusModel(json.status)
      : new StatusModel();
    this.statusLabel = this.status.getStatusLabel();
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
    if (json?.standardPaymentTermsOverride) {
      this.standardPaymentTermsOverride = json.standardPaymentTermsOverride === 'Z000'
        ? 'Immediately'
        : '14 Day';
    } else {
      this.standardPaymentTermsOverride = '';
    }
    this.lineItems = json?.lineItems ?? [];
    this.milestones = json?.milestones?.length >= 1
      ? json.milestones.map((milestoneJson: any) => new MilestoneModel(milestoneJson))
      : [];
    this.comments = json?.comments ?? '';
    this.attachments = json?.attachments ?? [];
  }

}
